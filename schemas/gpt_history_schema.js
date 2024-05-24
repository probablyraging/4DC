import mongoose from 'mongoose';

const gptHistoryschema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    conversations: {
        type: Array,
        required: true
    }
});

export default mongoose.model('gpthistory', gptHistoryschema);