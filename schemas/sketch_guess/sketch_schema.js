const mongoose = require('mongoose');

const sketchSchema = mongoose.Schema({

    currentWord: {
        type: String,
        required: true
    },
    currentDrawer: {
        type: String,
        required: true
    },
    previousDrawer: {
        type: String,
        required: true
    },
    urlId: {
        type: String,
        required: true
    },
    gameState: {
        type: Boolean,
        required: true
    },
    hintsLeft: {
        type: Number,
        required: true
    },
    usedLetters: {
        type: Array,
        required: true
    },
    sentHints: {
        type: Array,
        required: true
    },
    voteSkip: {
        type: Number,
        required: true
    },
    hasVoted: {
        type: Array,
        required: true
    },
    isSubmitted: {
        type: Boolean,
        required: true
    },
    wasGuessed: {
        type: Boolean,
        required: true
    },
    hasEnded: {
        type: Boolean,
        required: true
    }

});

module.exports = mongoose.model('sketchguess', sketchSchema)