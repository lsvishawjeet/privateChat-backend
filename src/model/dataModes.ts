
export interface Message {
    message: string,
    currentDate: string
}

export interface UserMessage {
    token: string,
    receiverId: string,
    data: Message
}

export interface UserModel {
    name: string,
    email: string,
    password: string
}

export interface ConnectedUser {
    userId: string,
    socketId: string,
    email: string,
    name: string
}

export interface WebSocketMessage {
    action: 'send_message' | 'get_online_users';
    token: string;
    receiverId?: string;
    data?: Message;
}