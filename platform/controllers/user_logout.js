const jwt = require("jsonwebtoken");
const {User}  = require("../models/user_models");
const client = require('../Utils/redis_connection')


exports.logout = async (req, res) => {
    try {
        const { headers } = req;

        const access_token = headers["access_token"];
        console.log(access_token, 'acces token in user logout')

        // Decode the token to get the ID
        const decoded = jwt.decode(access_token);
        const userId = decoded.userId
        
        const user = await User.findById( userId );

        if (user) {
                  // Calculate the time to live (TTL) in seconds
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);

        // Store the token in Redis with a TTL
        await client.setEx(access_token,ttl, 'true')
        // await client.setEx(refresh_token, ttl, 'true')

        return res.status(200).json({
            message: 'SUCCESS',
          })

        }

    }
  

 catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error during login" });
    }
  };
  