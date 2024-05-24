import mongoose from 'mongoose';

const warnSchema = mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    warnId: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true
    },
    authorTag: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    warnCount: {
        type: String,
        required: false
    }
});

export default mongoose.model('warnings', warnSchema);