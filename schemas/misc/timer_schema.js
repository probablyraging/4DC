const mongoose = require('mongoose');

const timerSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    timer: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('timer', timerSchema)