const {User, Boards}  = require("../models/user_models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


exports.DeleteSessions = async (req, res) => {
    try {
        console.log("HELO WORLD IN DELETE SESSIOn")
    // const { access_token } = req.body
    const { uuid } = req.body;
    console.log (uuid)

    //   const decoded = jwt.decode(access_token);
    //   const userId = decoded.userId
    //   const user = await User.findById( userId )

  
    //   if (!user) {
    //     return res.status(401).json({ message: "Invalid Access Token" });
    //   }

      delete_sessions = Boards.findByIdAndDelete(uuid)
      console.log(delete_sessions, 'delete')
      if (delete_sessions){
        return res.status(200).json({message: "Session Deleted"})

      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error while generating session" });
    }
  };
  