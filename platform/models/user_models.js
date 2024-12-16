const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

});


const BoardsSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    uuid: { type: String, required: true },
})


const User = mongoose.model('User', userSchema);
const Boards = mongoose.model('Boards', BoardsSchema)

module.exports = {User,  Boards};
