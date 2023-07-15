const mongoose = require('mongoose');

const newUsersSchema = mongoose.Schema({
    userId: {
        type: String,
        required: false
    },
    lastCheckedTimestamp: {
        type: String,
        required: false
    },
    lastCheckedUser: {
        type: String,
        required: false
    },
});

module.exports = mongoose.model('newusers', newUsersSchema)