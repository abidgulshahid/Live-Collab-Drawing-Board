const {User, Boards}  = require("../models/user_models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


exports.CreateBoard = async (req, res) => {
    try {
    const { access_token, name } = req.body

      const decoded = jwt.decode(access_token);
      const userId = decoded.userId
      const user = await User.findById( userId )

  
      if (!user) {
        return res.status(401).json({ message: "Invalid Access Token" });
      }

      const randomUUID = uuidv4();

      const createBoards = new Boards ({
        userID: user.id, 
        name: name, 
        uuid: randomUUID
      })
      await createBoards.save();


      if (createBoards) 
      {          
      return res
        .status(200)
        .json({          
            'uuid': randomUUID,
            'message': 'Login Successfully'
         });

      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error while generating session" });
    }
  };
  