const mongoose = require('mongoose');

const countingCurrent = mongoose.Schema({

    currentCount: {
        type: String,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('countingcurrent', countingCurrent)