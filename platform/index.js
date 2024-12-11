// importing libraries and modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const userRouter = require("./router/user_routes");
const bodyParser = require('body-parser')
const client = require('./Utils/redis_connection')
const cors = require("cors");


const init = async()=>{
 await client.connect()
 app.listen(port, () => {
        console.log(`server listening on port: ${port}`)
      })
}

init()

// Fetching Database URL from the .env file that's available in the root location of this project.
const mongoString = process.env.DATABASE_URL;


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



app.use("/api/v1/user", userRouter);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })