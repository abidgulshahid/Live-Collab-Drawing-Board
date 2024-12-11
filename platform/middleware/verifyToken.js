const client = require('../Utils/redis_connection')
const jwt = require("jsonwebtoken");
const {User, Journal}  = require("../models/user_models");

exports.verifyToken = async (req, res, next)  =>
    { 
    const { headers } = req;

    const token = headers["access_token"];
    if (!token) {
      return res.status(404).json({
        message: "Access Token is Missing"
      })
    } 
    const accessTokenPayload = jwt.verify(
        token,
        process.env.SECRET_KEY || "1234!@#%<{*&)",
      )
    
      const userId = accessTokenPayload.userId

      const user = await User.findById( userId )
      if (!user) {return res.status(400).send({message: "User Not Found"})}

    
      const blackListedRefreshToken = await client.get(token)
    
      if (blackListedRefreshToken == 'true') {
        return res.status(401).send({ message: 'Token has been blacklisted' });
      }
      req.userId = accessTokenPayload.userId
    
      next()
}