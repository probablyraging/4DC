import mongoose from 'mongoose';

const remindersSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

export default mongoose.model('reminders', remindersSchema);