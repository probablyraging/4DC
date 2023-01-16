const mongoose = require('mongoose');

const coinflipSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    playerOne: {
        type: String,
        required: true
    },
    playerTwo: {
        type: String,
        required: false
    },
    inProgress: {
        type: Boolean,
        required: false
    }
});

module.exports = mongoose.model('coinflips', coinflipSchema)