import mongoose from 'mongoose';

const inviteSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    uses: {
        type: String,
        required: true,
    },
});

export default mongoose.model('invites', inviteSchema);