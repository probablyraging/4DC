const mongoose = require('mongoose');

const streamSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    } 

});

module.exports = mongoose.model('liveNowStreams', streamSchema)