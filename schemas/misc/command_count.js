const mongoose = require('mongoose');

const commandCountSchema = mongoose.Schema({

    command: {
        type: String,
        required: true
    },
    uses: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('commandcount', commandCountSchema)