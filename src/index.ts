import { config } from 'dotenv';
config({ path: '.env.local' });
import express from "express";
import crypto from "crypto";
import os from "os";
import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws'
import { ConnectedUser } from './model/dataModes';
import { validateToken } from './utils/validations';
import { createUserController, getUserController, getAllUsersController } from './controller/userController';
import { send } from 'process';

// Use PORT from environment (Fly.io sets this), fallback to 8080
const port = parseInt(process.env.PORT || '8080', 10);
const app = express();
app.use(express.json())

// Create single server for both HTTP and WebSocket
// Listen on 0.0.0.0 to accept connections from any IP (required for Fly.io)
let httpsServer = app.listen(port, '0.0.0.0');

console.log(os.cpus().length)

app.get('/', (req, res) => {
	res.status(200).json({ 
		success: true, 
		message: "Private Chat API is running",
		endpoints: {
			health: '/health',
			signup: 'POST /auth/signup',
			login: 'POST /auth/login',
			users: 'GET /user/all',
			websocket: 'ws://[host]/ws?token=[your-token]'
		}
	});
});

app.get('/health', (req, res) => {
	res.status(200).json({ success: true, message: "Server is healthy" });
});
app.post('/auth/signup', createUserController);
app.post('/auth/login', getUserController);

app.get('/user/all', getAllUsersController);
// health route

//create a websocket connection on 4001 port
let wss = new WebSocketServer({ server: httpsServer, path: '/ws', maxPayload: 10 * 1024 * 1024 });

/*
Flow of app:
	Usr create profile by filling email (store in mongo)
	Usr get UUI (that is sent as connection id)
	Usr get token (this is for auth for setting web socket, if not sent that refuse connection)

	-- From here everyting will be using websockets --
	Get list of users (over websocket)
	click any user and chat with him / her
	Send the message to user (with user id in payload)
	message sent to that user over websocket

	connected user:
	[

	]

	wsConnections:[]
*/

let connectedUsers:ConnectedUser[] = [];
const wsConnections = new Map<string, WebSocket>();
let pendingMessagesStore: any[] = [];

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
	const socketId = crypto.randomUUID();
	wsConnections.set(socketId, ws);

	//extract token from url
	const url = new URL(req.url || '', `http://${req.headers.host}`);
	const token = url.searchParams.get('token');

	//check if token exists
	if (!token) {
		ws.send(JSON.stringify({ success: false, message: "No token provided" }));
		ws.close();
		wsConnections.delete(socketId);
		return;
	}

	//validate the token
	const isTokenValid = validateToken(token);
	if (!isTokenValid.success) {
		ws.send(JSON.stringify({ success: false, message: "Invalid or expired token" }));
		ws.close();
		wsConnections.delete(socketId);
		return;
	}

	//extract user info from token
	const userId = (isTokenValid.data as any).id;
	const email = (isTokenValid.data as any).email || "";
	const name = (isTokenValid.data as any).name || "";

	//add user to connected users
	connectedUsers.push({
		userId,
		socketId,
		email,
		name
	});

	console.log(`User ${name} (${userId}) connected with socket ${socketId}`);
	ws.send(JSON.stringify({ 
		success: true, 
		message: "Connected and authenticated",
		userId 
	}));

	//send any pending messages to this user
	sendPendingMessages(userId, ws);

	// At this point we have users stored in connected users
	
	ws.on('close', () => {
        connectedUsers = connectedUsers.filter(u => u.socketId !== socketId);
        wsConnections.delete(socketId); 
        console.log(`Socket ${socketId} disconnected`);
    });

	ws.on('message', (rawData) => {
		try {
			const message = JSON.parse(rawData.toString());
			//handle different actions
			if(message.action === 'get_online_users'){
				//return list of online users excluding passwords
				const onlineUsers = connectedUsers.map(u => ({
					userId: u.userId,
					email: u.email,
					name: u.name
				}));
				ws.send(JSON.stringify({
					success: true,
					action: 'online_users',
					data: onlineUsers
				}));
			} else if(message.action === 'send_message'){
				//send message to specific user
				const result = sendMessage(message, socketId);
				ws.send(JSON.stringify(result));
			} else {
				ws.send(JSON.stringify({ success: false, message: "Unknown action" }));
			}

		} catch (error) {
			console.log("Error parsing message", error);
			ws.send(JSON.stringify({ success: false, message: "Invalid message format" }));
		}
	})

	ws.on('error', (err) => {
		console.log(`error: ${err.message}`);
	})

})

const sendMessage = (userMessage: any, senderSocketId: string) => {
	//find sender from connected users
	const sender = connectedUsers.find(u => u.socketId === senderSocketId);
	if (!sender) {
		return { success: false, message: "Sender not found" };
	}
	
	const senderId = sender.userId;
	const receiverId = userMessage.receiverId;

	//check if required fields are present
	if(!userMessage.receiverId || !userMessage.data){
		return { success: false, message: "Missing receiverId or data" };
	}

	//find receiver in connected users
	const receiver = connectedUsers.find(u => u.userId == receiverId);

	if(!receiver){
		//receiver is offline, store message for later delivery
		pendingMessagesStore.push({
			senderId: senderId,
			receiverId: receiverId,
			data: userMessage.data
		});
		return { success: true, message: "Receiver is offline, message will be delivered when they connect" };
	}

	//receivers websocket connection
	const receiverWs = wsConnections.get(receiver.socketId);

	if(receiverWs && receiverWs.readyState === WebSocket.OPEN){
		receiverWs.send(JSON.stringify({
			success: true,
			action: 'new_message',
			sender: senderId,
			type: userMessage.data.type,
			message: userMessage.data.message,
			messageTime: userMessage.data.currentDate
		}));
		return { success: true, message: "Message sent" };
	}
	return { success: false, message: "Failed to send message" };
}

const sendPendingMessages = (userId: string, ws: WebSocket) => {
	const pendingMessages = pendingMessagesStore.filter((msg: any) => msg.receiverId === userId);
			pendingMessages.forEach((msg: any) => {
				ws.send(JSON.stringify({
					success: true,
					action: 'new_message',
					sender: msg.senderId,
					type: msg.data.type,
					message: msg.data.message,
					messageTime: msg.data.currentDate
				}));
			});
			//remove sent messages from pending store
			pendingMessagesStore= pendingMessagesStore.filter((msg: any) => msg.receiverId !== userId);
}

// Remove duplicate app.listen - already listening above with httpsServer
console.log(`Server is running on port ${port}`);

