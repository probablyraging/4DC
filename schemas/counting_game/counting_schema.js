const mongoose = require('mongoose');

const countingSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    discriminator: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    saves: {
        type: Number,
        required: true
    },
    counts: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('countinggame', countingSchema)