import mongoose from 'mongoose';

const introSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    messageId: {
        type: String,
        required: true,
    },
});

export default mongoose.model('introductions', introSchema);