const {User, Journal}  = require("../models/user_models");
const jwt = require("jsonwebtoken");


exports.home_api = async (req, res) => {
    try {
    const { access_token } = req.body

      const decoded = jwt.decode(access_token);
      const userId = decoded.userId
      const user = await User.findById( userId )
      const total_entries = (await Journal.find({userID:userId}))
      console.log(total_entries.length, 'length')

  
      if (!user) {
        return res.status(401).json({ message: "Invalid Access Token" });
      }

  
      return res
        .status(200)
        .json({ 
            "data": user, 
            'username': user.username,
            'total_entries': total_entries.length,

          'message': 'Login Successfully'
          

         });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error during login" });
    }
  };
  