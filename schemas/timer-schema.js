const mongoose = require('mongoose');

const timerSchema = mongoose.Schema({

    timestamp: {
        type: String,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    } 

});

module.exports = mongoose.model('ckTimer', timerSchema)