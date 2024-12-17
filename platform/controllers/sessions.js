const {User, Boards}  = require("../models/user_models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


exports.ListBoards = async (req, res) => {
    try {
    const { access_token } = req.body

      const decoded = jwt.decode(access_token);
      const userId = decoded.userId
      const user = await User.findById( userId )
      console.log(user.id)
      if (!user) {
        return res.status(401).json({ message: "Invalid Access Token" });
      }

      const getBoards = await Boards.find({ userID: userId })
      console.log(getBoards, 'getboards')

      if (getBoards.length >= 1){

        return res
        .status(200)
        .json({          
            data: getBoards, 
            'message': 'Fetched Successfully'
         });

      }

      else {

        return res
        .status(200)
        .json({          
            'message': 'No Data Found'
         });

      }



 

      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error while generating session" });
    }
  };
  