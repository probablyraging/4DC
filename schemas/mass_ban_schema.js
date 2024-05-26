import mongoose from 'mongoose';

const massbanSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    author: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    users: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
        default: 'PENDING',
    },
});

export default mongoose.model('massbans', massbanSchema);
