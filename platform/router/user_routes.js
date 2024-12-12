const express = require('express');
const { signUp } = require('../controllers/user_signup');
const { login } = require('../controllers/user_login');
const { logout } = require('../controllers/user_logout');
const {verifyToken} = require("../middleware/verifyToken")
const {updateProfile} = require("../controllers/update_profile");
const { home_api } = require('../controllers/home_api');


const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/home/update_profile', verifyToken, updateProfile)
router.post('/home', verifyToken, home_api)


module.exports = router;
