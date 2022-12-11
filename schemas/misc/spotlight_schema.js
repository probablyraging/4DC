const mongoose = require('mongoose');

const spotlightSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('spotlight', spotlightSchema)