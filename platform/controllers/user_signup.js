const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User}  = require("../models/user_models");

exports.signUp = async (request, res) => {
  try {
    console.log(request.body )
    const { username, password, full_name, location, email } = request.body;

    // Check If The Input Fields are Valid
    if (!username || !password || !full_name || !location ||  !email) {
      return res
        .status(400)
        .json({ message: "Please Input your Correct Data" });
    }

    // Check If User Exists In The Database
    const existingUser = await User.findOne({ username });
    console.log(existingUser, 'existing')

    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // Hash The User's Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save The User To The Database
    const newUser = new User({
      username,
      full_name, location, email,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User Created Successfully", newUser });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Error creating user" });
  }
};
