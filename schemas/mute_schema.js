const mongoose = require('mongoose');

const muteSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('mutes', muteSchema)