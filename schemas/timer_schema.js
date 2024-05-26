import mongoose from 'mongoose';

const timerSchema = mongoose.Schema({
    timestamp: {
        type: String,
        required: true,
    },
    timer: {
        type: String,
        required: true,
    },
});

export default mongoose.model('timer', timerSchema);