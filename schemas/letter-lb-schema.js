const mongoose = require('mongoose');

const letterLBSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    correctCount: {
        type: String,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    } 

});

module.exports = mongoose.model('letterLeaderboard', letterLBSchema)