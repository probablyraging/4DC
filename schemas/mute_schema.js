import mongoose from 'mongoose';

const muteSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    }
});

export default mongoose.model('mutes', muteSchema);