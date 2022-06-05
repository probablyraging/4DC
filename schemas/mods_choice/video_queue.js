const mongoose = require('mongoose');

const ccVideoQueue = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    videoQueue: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('creatorcrewvideoqueue', ccVideoQueue);