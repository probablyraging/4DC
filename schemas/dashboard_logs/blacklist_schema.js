const mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    reson: {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('blacklist', blacklistSchema)