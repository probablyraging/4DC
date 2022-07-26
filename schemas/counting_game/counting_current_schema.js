const mongoose = require('mongoose');

const countingCurrent = mongoose.Schema({

    currentCount: {
        type: Number,
        required: true
    },
    currentRecord: {
        type: Number,
        required: true
    },
    previousCounter: {
        type: String,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('countingcurrent', countingCurrent)