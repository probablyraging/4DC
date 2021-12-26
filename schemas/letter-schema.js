const mongoose = require('mongoose');

const letterSchema = mongoose.Schema({

    currentLetterCounter: {
        type: String,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    }   

});

module.exports = mongoose.model('letterCount', letterSchema)