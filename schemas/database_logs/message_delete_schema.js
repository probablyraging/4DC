const mongoose = require('mongoose');

const messageDeleteSchema = mongoose.Schema({

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
    message: {
        type: String,
        required: false
    },
    attachment: {
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

module.exports = mongoose.model('messagedeletes', messageDeleteSchema)