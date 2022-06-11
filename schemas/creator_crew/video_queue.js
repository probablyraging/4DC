const mongoose = require('mongoose');

const ccVideoQueue = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    videoAuthor: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    notified3: {
        type: Boolean,
        required: false
    },
    notified5: {
        type: Boolean,
        required: false
    }
});

module.exports = mongoose.model('creatorcrewvideoqueue', ccVideoQueue);