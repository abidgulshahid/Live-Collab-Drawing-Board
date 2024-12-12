const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User}  = require("../models/user_models");

exports.login = async (req, res) => {
  console.log(req.body)
    try {
      const { username, password } = req.body;
  
      // Check If The Input Fields are Valid
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please Input Username and Password" });
      }
  
      // Check If User Exists In The Database
      const user = await User.findOne({ username });
      console.log('user,', user)

  
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
  
      // Compare Passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const refresh_token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.SECRET_REFRESH_TOKEN || "1234!@#%<{*&)",
        { expiresIn: "6h" }

      )
  
      // Generate JWT Token
      const access_token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.SECRET_KEY || "1234!@#%<{*&)",
        { expiresIn: "6h" }
      );
 
      console.log("HELLO", user)
        return res
        .status(200)
        .json({ 
          'access_token' : access_token,
          'refresh_token': refresh_token,
          data: user,
          'message': 'Login Successfully'
          

         });
      

  
    
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error during login" });
    }
  };
  