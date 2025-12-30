# Chat Application - Friend Group Chat

A real-time chat application built with Node.js, Express, MongoDB, and WebSockets for 7 friends to chat individually.

## Features

- ✅ User registration and authentication
- ✅ JWT-based authentication
- ✅ Real-time messaging via WebSockets
- ✅ One-on-one chat functionality
- ✅ Online users tracking
- ✅ MongoDB for data persistence

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:
- `MONGO_DB_KEY`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `PORT`: HTTP server port (default: 4003)
- `WEBSOCKET_PORT`: WebSocket server port (default: 4001)

### 3. Build the Project

```bash
npm run build
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Documentation

### REST API Endpoints

#### 1. Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "userExist": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

#### 3. Get All Users
**GET** `/user/all`

Retrieve all registered users (passwords excluded).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

### WebSocket API

**WebSocket URL:** `ws://localhost:4001/ws`

All WebSocket messages require authentication via JWT token.

#### 1. Get Online Users

Get a list of currently connected users.

**Send:**
```json
{
  "action": "get_online_users",
  "token": "your_jwt_token_here"
}
```

**Receive:**
```json
{
  "success": true,
  "action": "online_users",
  "data": [
    {
      "userId": "user_id_1",
      "email": "john@example.com",
      "name": "John Doe"
    },
    {
      "userId": "user_id_2",
      "email": "jane@example.com",
      "name": "Jane Smith"
    }
  ]
}
```

#### 2. Send Message

Send a message to a specific user.

**Send:**
```json
{
  "action": "send_message",
  "token": "your_jwt_token_here",
  "receiverId": "receiver_user_id",
  "data": {
    "message": "Hello! How are you?",
    "currentDate": "2025-12-19T10:30:00.000Z"
  }
}
```

**Sender receives:**
```json
{
  "success": true,
  "message": "Message sent"
}
```

**Receiver receives:**
```json
{
  "success": true,
  "action": "new_message",
  "sender": "sender_user_id",
  "message": "Hello! How are you?",
  "messageTime": "2025-12-19T10:30:00.000Z"
}
```

## Usage Flow

### For Your 7 Friends Group

1. **Each friend signs up:**
   - Make a POST request to `/auth/signup` with name, email, and password

2. **Each friend logs in:**
   - Make a POST request to `/auth/login` with email and password
   - Save the received JWT token

3. **Get list of all users:**
   - Make a GET request to `/user/all`
   - Each friend can see all registered users

4. **Connect to WebSocket:**
   - Connect to `ws://localhost:4001/ws`
   - First message must include the JWT token for authentication

5. **See who's online:**
   - Send: `{"action": "get_online_users", "token": "your_token"}`
   - Receive list of currently connected friends

6. **Send messages:**
   - Send messages using the send_message action with receiverId
   - Messages are delivered in real-time only to the specified receiver

## Project Structure

```
privateChat/
├── src/
│   ├── controller/
│   │   └── userController.ts
│   ├── db/
│   │   ├── dbConnect.ts
│   │   └── model/
│   │       └── userModel.ts
│   ├── model/
│   │   └── dataModes.ts
│   ├── service/
│   │   └── userService.ts
│   ├── utils/
│   │   └── validations.ts
│   └── index.ts
├── .env.example
├── .env.local (create this)
├── package.json
└── tsconfig.json
```

## Security Notes

1. **JWT Secret:** Use a strong, random secret in production
2. **Environment Variables:** Never commit `.env.local` to version control
3. **Password Hashing:** Passwords are hashed with bcrypt (10 rounds)
4. **Token Expiration:** JWT tokens expire after 30 days

## Testing with WebSocket Clients

You can test WebSocket functionality using:
- **Browser Console:** Use native WebSocket API
- **Postman:** Has WebSocket support
- **wscat:** Command-line WebSocket client
- **Online tools:** websocket.org/echo.html

### Example using Browser Console:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:4001/ws');

// Handle connection open
ws.onopen = () => {
  console.log('Connected!');
  
  // Get online users
  ws.send(JSON.stringify({
    action: 'get_online_users',
    token: 'your_jwt_token_here'
  }));
};

// Handle incoming messages
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Send a message
ws.send(JSON.stringify({
  action: 'send_message',
  token: 'your_jwt_token_here',
  receiverId: 'receiver_user_id',
  data: {
    message: 'Hello!',
    currentDate: new Date().toISOString()
  }
}));
```

## Troubleshooting

### MongoDB Connection Error
- Verify your `MONGO_DB_KEY` in `.env.local`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure network access is configured correctly

### WebSocket Connection Issues
- Verify WebSocket port is not in use
- Check firewall settings
- Ensure proper JWT token is being sent

### Token Validation Failed
- Token might be expired (30-day expiration)
- JWT_SECRET might have changed
- User needs to log in again

## License

ISC
