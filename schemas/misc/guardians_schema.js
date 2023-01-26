const mongoose = require('mongoose');

const guardiansSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('guardians', guardiansSchema)