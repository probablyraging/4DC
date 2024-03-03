import mongoose from 'mongoose';

const rankSchema = mongoose.Schema({
    rank: {
        type: Number,
        required: false
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        required: true
    },
    msgCount: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    xxp: {
        type: Number,
        required: true
    },
    xxxp: {
        type: Number,
        required: true
    }
});

export default mongoose.model('ranks', rankSchema);