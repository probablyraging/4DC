const mongoose = require('mongoose');

const rankSchema = mongoose.Schema({

    rank: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    discrim: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    msgCount: {
        type: String,
        required: true
    },
    xp: {
        type: String,
        required: true
    },
    xxp: {
        type: String,
        required: true
    },
    xxxp: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('ranks', rankSchema)