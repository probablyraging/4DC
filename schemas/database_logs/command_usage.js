const mongoose = require('mongoose');

const commandUsageSchema = mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: false
    },
    input: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('commandusage', commandUsageSchema)