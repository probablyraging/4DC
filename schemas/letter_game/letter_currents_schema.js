const mongoose = require('mongoose');

const letterCurrent = mongoose.Schema({

    lastLetter: {
        type: String,
        required: true
    },
    previousWord: {
        type: String,
        required: true
    },
    currentLevel: {
        type: Number,
        required: true
    },
    currentRecord: {
        type: Number,
        required: true
    },
    previousSubmitter: {
        type: String,
        required: true
    },
    previousUsedWords: {
        type: Array,
        required: true
    },
    searchFor: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('lettercurrent', letterCurrent)