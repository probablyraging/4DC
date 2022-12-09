const mongoose = require('mongoose');

const countingSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false
    },
    discriminator: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
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