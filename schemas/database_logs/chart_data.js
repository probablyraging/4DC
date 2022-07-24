const mongoose = require('mongoose');

const chartData = mongoose.Schema({

    date: {
        type: String,
        required: true
    },
    joins: {
        type: String,
        required: false
    },
    leaves: {
        type: String,
        required: false
    },
    bans: {
        type: String,
        required: false
    },
    messages: {
        type: String,
        required: false
    },
    timeouts: {
        type: String,
        required: false
    },
    warnings: {
        type: String,
        required: false
    },
    newcommunicators: {
        type: String,
        required: false
    },
    newcommunicatorsarr: {
        type: Array,
        required: false
    }

});

module.exports = mongoose.model('chartdata', chartData);