const {User, Boards}  = require("../models/user_models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


exports.DeleteSessions = async (req, res) => {
    try {
        console.log("HELO WORLD IN DELETE SESSIOn")
    // const { access_token } = req.body
    const { uuid } = req.body;


      delete_sessions = await Boards.findByIdAndDelete(uuid)
      
        return res.status(200).json({message: "Session Deleted"})

      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error while generating session" });
    }
  };
  