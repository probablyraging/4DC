const mongoose = require('mongoose');

const timerSchema = mongoose.Schema({

    timestamp: {
        type: String,
        required: true
    },
    timer: {
        type: String,
        required: true
    },
    previouslyFeatured: {
        type: String,
        required: false
    }

});

module.exports = mongoose.model('ckTimer', timerSchema)