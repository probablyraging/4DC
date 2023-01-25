const mongoose = require('mongoose');

const weeklyLeaderboardSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    msgCount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('weeklyleaderboard', weeklyLeaderboardSchema)