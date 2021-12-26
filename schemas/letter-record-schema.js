const mongoose = require('mongoose');

const letterRecordSchema = mongoose.Schema({

    letterRecord: {
        type: String,
        required: true
    },
    searchForRecord: {
        type: String,
        required: true
    }    

});

module.exports = mongoose.model('letterRecord', letterRecordSchema)