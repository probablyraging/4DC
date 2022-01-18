const mongoose = require('mongoose');

const modsChoiceVideoSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    videoTs: {
        type: Number,
        required: true
    },
    videoMessageId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('modsChoiceVideo', modsChoiceVideoSchema)
