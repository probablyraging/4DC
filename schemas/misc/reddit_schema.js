const mongoose = require('mongoose');

const redditSchema = mongoose.Schema({
    postIds: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('redditposts', redditSchema)