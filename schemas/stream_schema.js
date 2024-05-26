import mongoose from 'mongoose';

const streamSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
});

export default mongoose.model('liveNowStreams', streamSchema);