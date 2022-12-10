const mongoose = require('mongoose');
const { dbTwo } = require('../../mongo');

const rankSchema = mongoose.Schema({

    rank: {
        type: Number,
        required: false
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
    avatar: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        required: true
    },
    msgCount: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    xxp: {
        type: Number,
        required: true
    },
    xxxp: {
        type: Number,
        required: true
    },

});

module.exports = dbTwo.model('ranks', rankSchema);