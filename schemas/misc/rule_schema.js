const mongoose = require('mongoose');

const ruleSchema = mongoose.Schema({
    rule: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('rules', ruleSchema);