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

// WebSocket connection handling
wsApp.ws('/*', {
    open: (ws) => {
        clients.push(ws);
        ws.subscribe('draw')
        console.log(ws)
    },
    message: (ws, message, isBinary) => {
      const decodedMessage = Buffer.from(message).toString();
      const data = JSON.parse(decodedMessage)
      console.log(data)
      if (data.type === 'register') {
        const { username } = data;
        userSockets.set(username, ws); // Store the user's socket
        console.log(`${username} connected`);
      }
  
      // Handle invite messages
      if (data.type === 'invite') {
        const { username, from } = data;
        const targetUserSocket = getUserSocket(username);
        if (targetUserSocket) {
          targetUserSocket.send(JSON.stringify({
            type: 'invite',
            from: from,
            message: `${from} has invited you to draw together!`
          }));
        } else {
          console.log(`User ${username} not found`);
        }
      }

      // Handle invite acceptance
      if (data.type === 'invite-accepted') {
        const { from, to } = data;
        const inviterSocket = getUserSocket(from);
        if (inviterSocket) {
          inviterSocket.send(JSON.stringify({
            type: 'invite-accepted',
            message: `${to} has accepted your invite to draw together!`
          }));
        }
      }

      // Broadcast the drawing data to all clients
      ws.publish('draw', decodedMessage, isBinary);
  },
    close: (ws, code, message) => {
        clients = clients.filter(client => client !== ws);
        for (const [username, socket] of userSockets.entries()) {
          if (socket === ws) {
            userSockets.delete(username);
            console.log(`${username} disconnected`);
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

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })