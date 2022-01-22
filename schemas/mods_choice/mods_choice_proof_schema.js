const mongoose = require('mongoose');

const modsChoiceProofSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    proofTs: {
        type: Number,
        required: true
    },
    proofId: {
        type: String,
        required: true
    },
    userNotified: {
        type: Boolean,
        required: true,
        default: false
    },
    staffNotified: {
        type: Boolean,
        required: true,
        default: false
    },
    missedCount: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('modsChoiceProof', modsChoiceProofSchema)
