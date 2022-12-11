const mongoose = require('mongoose');

const qotdSchema = mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    messageIds: {
        type: Array,
        required: false
    },
    index: {
        type: Number,
        require: false
    }
});

module.exports = mongoose.model('qotd', qotdSchema);