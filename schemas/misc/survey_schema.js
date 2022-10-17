const mongoose = require('mongoose');

const surveySchema = mongoose.Schema({

    reddit: {
        type: Number,
        required: false
    },
    google: {
        type: Number,
        required: false
    },
    youtube: {
        type: Number,
        required: false
    },
    friend: {
        type: Number,
        required: false
    },
    other: {
        type: Number,
        required: false
    },

});

module.exports = mongoose.model('surveys', surveySchema);