const mongoose = require('mongoose');

const gptHistorychema = mongoose.Schema({
    conversations: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('gpthistory', gptHistorychema)