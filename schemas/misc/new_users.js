const mongoose = require('mongoose');

const newUsersSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('newusers', newUsersSchema)