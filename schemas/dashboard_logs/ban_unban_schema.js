const mongoose = require('mongoose');

const banUnbanSchema = mongoose.Schema({

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

module.exports = mongoose.model('banunbans', banUnbanSchema)