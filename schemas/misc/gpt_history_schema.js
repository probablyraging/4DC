const mongoose = require('mongoose');

const gptHistorychema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    conversations: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('gpthistory', gptHistorychema)