# 🚀 Quick Start Guide - Chat App for 7 Friends

## Step 1: Setup Environment (5 minutes)

1. **Copy the environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your details:**
   - Add your MongoDB connection string
   - Add a strong JWT secret
   ```
   MONGO_DB_KEY=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-key-here
   ```

## Step 2: Start the Server (1 minute)

```bash
npm run dev
```

You should see:
```
app is working on port 4003
Successfully connected to MongoDB!
```

## Step 3: Create Accounts for All 7 Friends

Use Postman, curl, or any HTTP client to create accounts:

**POST** `http://localhost:4003/auth/signup`

```json
{
  "name": "Friend 1",
  "email": "friend1@example.com",
  "password": "password123"
}
```

Repeat for all 7 friends.

## Step 4: Login and Get Tokens

**POST** `http://localhost:4003/auth/login`

```json
{
  "email": "friend1@example.com",
  "password": "password123"
}
```

**Save the token from response!** Each friend needs their own token.

## Step 5: Test WebSocket Connection

### Option A: Use the HTML Test Client

1. Open `websocket-test.html` in your browser
2. Paste your JWT token
3. Click "Connect"
4. Click "Get Online Users"

### Option B: Use Browser Console

```javascript
const ws = new WebSocket('ws://localhost:4001/ws');

ws.onopen = () => {
  // Get online users
  ws.send(JSON.stringify({
    action: 'get_online_users',
    token: 'YOUR_JWT_TOKEN_HERE'
  }));
};

ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## Step 6: Send Messages Between Friends

```javascript
// Friend 1 sends message to Friend 2
ws.send(JSON.stringify({
  action: 'send_message',
  token: 'FRIEND_1_TOKEN',
  receiverId: 'FRIEND_2_USER_ID',
  data: {
    message: 'Hey! How are you?',
    currentDate: new Date().toISOString()
  }
}));
```

## Common Use Cases

### Get All Registered Users
**GET** `http://localhost:4003/user/all`

This returns all 7 friends with their user IDs.

### See Who's Online
Send via WebSocket:
```json
{
  "action": "get_online_users",
  "token": "YOUR_TOKEN"
}
```

### Chat One-on-One
1. Connect to WebSocket with your token
2. Use the receiverId from the user list
3. Send messages using send_message action

## Testing Scenario for 7 Friends

1. **Friend 1** connects → Gets notified they're online
2. **Friend 2** connects → Both see each other online
3. **Friend 1** sends message to **Friend 2** → Delivered instantly
4. **Friend 3** connects → All see each other
5. Continue for all 7 friends!

## Troubleshooting

### "Invalid or expired token"
- Login again to get a fresh token
- Tokens expire after 30 days

### "Receiver is not online"
- The person you're messaging must be connected to WebSocket
- Check online users list first

### MongoDB connection error
- Check your connection string in `.env.local`
- Whitelist your IP in MongoDB Atlas

## Pro Tips

- Each friend needs their own account and token
- Messages are only delivered if receiver is online
- Use the HTML test client for easy testing
- Keep tokens secure - they give full access!

## Ready to Chat! 🎉

Your app is now ready for all 7 friends to:
- Sign up individually
- Login and get their tokens
- Connect via WebSocket
- See who's online
- Send private messages to each other

Have fun chatting! 💬
