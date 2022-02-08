const mongoose = require('mongoose');

const mcWarnSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    warnId: {
        type: String,
        required: true,
    },
    warnedBy: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    messageUrl: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('modsChoiceWarnings', mcWarnSchema)
