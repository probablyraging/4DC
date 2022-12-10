const mongoose = require('mongoose');
const { dbTwo } = require('../../mongo');

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

module.exports = dbTwo.model('qotd', qotdSchema);