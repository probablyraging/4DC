const mongoose = require('mongoose');

const muteTimeoutSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    authorTag: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
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

module.exports = mongoose.model('mutestimeouts', muteTimeoutSchema)