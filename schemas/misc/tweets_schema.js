const mongoose = require('mongoose');

const tweetsSchema = mongoose.Schema({
    ids: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('tweets', tweetsSchema)