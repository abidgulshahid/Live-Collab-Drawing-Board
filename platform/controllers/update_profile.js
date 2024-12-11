const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User}  = require("../models/user_models");

exports.updateProfile = async (request, res) => {
  try {
    const { user_id, password, full_name, location, email } = request.body;

    // Input validation
    const validationError = validateUpdateInput(request.body);
    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      location: location.trim(),
      full_name: full_name.trim(),
    };

    // Password handling
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    sanitizedData.password = hashedPassword;

    // Update user
    const existingUser = await User.findByIdAndUpdate(
      user_id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function for input validation
const validateUpdateInput = (data) => {
  const { password, full_name, location, email } = data;

  if (!password || !full_name || !location || !email) {
    return 'All fields are required';
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return 'Invalid email format';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  return null;
};
