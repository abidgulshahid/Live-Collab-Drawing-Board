// importing libraries and modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const userRouter = require("./router/user_routes");
const bodyParser = require('body-parser')
const client = require('./Utils/redis_connection')
const cors = require("cors");
const uWS = require('uWebSockets.js');


const init = async()=>{
 await client.connect()
 app.listen(port, () => {
        console.log(`server listening on port: ${port}`)
      })
}

init()

// Fetching Database URL from the .env file that's available in the root location of this project.
const mongoString = process.env.DATABASE_URL;


// Create a uWebSocket server
const wsApp = uWS.App();

const userSockets = new Map();

let clients = [];

const connectedUsers = new Set(); // Set to store connected usernames
const activeSessions = new Map(); 

// WebSocket connection handling
wsApp.ws('/*', {
    open: (ws) => {
        clients.push(ws);
        ws.subscribe('draw')
        console.log(ws, 'ws')
    },
    message: (ws, message, isBinary) => {
      const decodedMessage = Buffer.from(message).toString();
      const data = JSON.parse(decodedMessage)
      console.log(data, 'data')
      if (data.type === 'register') {
        const { username } = data;
        userSockets.set(username, ws); // Store the user's socket
        connectedUsers.add(username); // Add username to the set
        console.log(`${username} connected`);

        // Notify all clients about the updated user list
        // broadcastUserList();
      }
  
    // ... existing code ...
      // Handle invite acceptance
      if (data.type === 'invite-accepted') {
        const { from, to } = data;
    
        // Create a session for the users if it doesn't exist
        const sessionId = `${from}-${to}`; // Unique session ID based on usernames
        if (!activeSessions.has(sessionId)) {
            activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(from);
        activeSessions.get(sessionId).add(to);
    
        // Notify the inviter
        const inviterSocket = getUserSocket(from);
        if (inviterSocket) {
            inviterSocket.send(JSON.stringify({
                type: 'invite-accepted',
                message: `${to} has accepted your invite to draw together!`
            }));
        }
      }
      console.log(data)
      // Handle drawing data exchange for the session
      if (data.draw === 'draw') {
        const { sessionId, drawingData } = data; // Assuming drawingData is sent with the message
        const sessionClients = activeSessions.get(sessionId);
        if (sessionClients) {
            for (const username of sessionClients) {
                const userSocket = getUserSocket(username);
                if (userSocket) {
                  ws.publish('draw', decodedMessage, isBinary);
                    userSocket.send(JSON.stringify({
                        type: 'draw',
                        drawingData: drawingData
                    }));
                }
            }
        }
      }
// ... existing code ...

      // Handle remove user command
      if (data.type === 'remove-user') {
        const { username } = data;
        const targetUserSocket = getUserSocket(username);
        if (targetUserSocket) {
          targetUserSocket.send(JSON.stringify({
            type: 'remove-user',
            message: `You have been removed from the drawing board.`
          }));
          targetUserSocket.close(); // Optionally close the connection
        }
      }

 

      if (data.signal == 'true'){
        console.log("HELLO WORLD")

      }


      // Broadcast the drawing data to all clients

      ws.publish('draw', decodedMessage, isBinary);

   
  },
  close: (ws, code, message) => {
    clients = clients.filter(client => client !== ws);
    for (const [username, socket] of userSockets.entries()) {
        if (socket === ws) {
            userSockets.delete(username);
            connectedUsers.delete(username);

            // Remove the user from active sessions
            activeSessions.delete(username);
            for (const peers of activeSessions.values()) {
                peers.delete(username);
            }

            console.log(`${username} disconnected`);

            // Notify all clients about the updated user list
            broadcastUserList();
            break;
        }
    }
}
});




function getUserSocket(username) {
  return userSockets.get(username); // 
}

// Connecting to Database
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected');
})


const app = express()
const port = 4000 //Setting the port to 300 so we can access it
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple Route for if the web service is connected or not.
app.get('/', (req, res) => {
  console.log(req)
  res.json({message: "Server Connected"})
})

app.use(cors({credentials: true, origin: true}));

wsApp.listen(3001, (token) => {
  if (token) {
      console.log('WebSocket server running at ws://localhost:3001', token);
  } else {
      console.log('Failed to start WebSocket server');
  }
});

app.use("/api/v1/user", userRouter);

// Function to broadcast the list of connected users to all clients

function broadcastUserList() {

  const userList = Array.from(connectedUsers);
  const message = JSON.stringify({
    type: 'user-list',
    users: userList
  });

  // Send the user list to all connected clients
  for (const socket of userSockets.values()) {
    socket.send(message);
  }
}


// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })