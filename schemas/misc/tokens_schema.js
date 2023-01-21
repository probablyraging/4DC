const mongoose = require('mongoose');

const tokensSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    tokens: {
        type: Number,
        required: true
    },
    dailyTokens: {
        type: Number,
        required: false
    },
    availableAward: {
        type: Boolean,
        required: false
    },
    initialNotification: {
        type: Boolean,
        required: false
    },
    doublexp: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    emojiorsticker: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    youtubeauto: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    twitchauto: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    livenow: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    giveaways: {
        type: mongoose.SchemaTypes.Mixed,
        required: false
    },
    gameWins: {
        type: Number,
        required: false
    },
    gameLosses: {
        type: Number,
        required: false
    },
    tokenWins: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('tokens', tokensSchema);