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


const wsApp = uWS.App();

const userSockets = new Map();

let clients = [];

let connectedUsers = [];
const activeSessions = new Map(); 

// WebSocket connection handling
wsApp.ws('/*', {
    open: (ws) => {
        clients.push(ws);
        ws.subscribe('draw')
    },
    message: (ws, message, isBinary) => {
      const decodedMessage = Buffer.from(message).toString();
      const data = JSON.parse(decodedMessage)
      if (data.type === 'register') {
        const { username } = data;
        userSockets.set(username, ws); 
        connectedUsers.push({ username: data.username, uuid: data.uuid });
        broadcastUserList(); 

      }

      if (data.type === 'invite-accepted') {
        const { from, to } = data;
    
       
        const sessionId = `${from}-${to}`; 
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

      if (data.type === 'remove-user') {
        const { username } = data;
        const targetUserSocket = getUserSocket(username);
        connectedUsers = connectedUsers.filter(user => user.username !== data.username);
        if (targetUserSocket) {
          targetUserSocket.send(JSON.stringify({
            type: 'remove-user',
            message: `You have been removed from the drawing board.`
          }));
          targetUserSocket.close(); // Optionally close the connection
        }
      }
      else if (data.type === 'message') {
        broadcast({ type: 'message', username: data.username, text: data.text });
    } 
      

 

      if (data.signal == 'true'){
        console.log("HELLO WORLD")

      }

      ws.publish('draw', decodedMessage, isBinary);

   
  },
  close: (ws, code, message) => {
    clients = clients.filter(client => client !== ws);
    for (const [username, socket] of userSockets.entries()) {
        if (socket === ws) {
            userSockets.delete(username);
            connectedUsers = connectedUsers.filter(user => user.username !== username);

            activeSessions.delete(username);
            for (const peers of activeSessions.values()) {
                peers.delete(username);
            }

            console.log(`${username} disconnected`);

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

  const userListMessage = JSON.stringify({
    type: 'user-list',
    users: connectedUsers.map(user => user.username),
});



  console.log('Broadcasting user list:', userList); // Log the user list being broadcasted
  for (const socket of userSockets.values()) {
    socket.send(userListMessage);
  }
}
const broadcast = (data) => {
  wsApp.publish('chat', JSON.stringify(data), false); // Publish to all clients
};