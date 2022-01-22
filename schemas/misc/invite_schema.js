const mongoose = require('mongoose');

const inviteSchema = mongoose.Schema({

    code: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    uses: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('invites', inviteSchema)