import mongoose from 'mongoose';

const ytNotificationSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    videoIds: {
        type: Array,
        required: true
    },
    timestamp: {
        type: Date,
        required: false
    }
});

export default mongoose.model('ytnotifications', ytNotificationSchema)