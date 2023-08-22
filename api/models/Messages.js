const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    name: String,
    email: String,
    msg: String,
    time: Number,
    socketID: String,
    friendEmail: String,
});

module.exports = mongoose.model('Messages', messagesSchema);