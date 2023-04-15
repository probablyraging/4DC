const mongoose = require('mongoose');

const introSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('introductions', introSchema)