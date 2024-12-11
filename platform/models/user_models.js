const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

});

const journalSchema = new mongoose.Schema({
    text: { type: String, required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readability: { type: String, required: true },
    tone: { type: String, required: true },

    date: { type: Date, required: false, default: Date.now },
});

const Journal = mongoose.model('Journal', journalSchema);

const User = mongoose.model('User', userSchema);

module.exports = {User, Journal};
// module.exports = Journal;
