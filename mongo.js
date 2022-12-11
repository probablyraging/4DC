const mongoose = require('mongoose');
const path = require('path');

// Remove dep warning
mongoose.set('strictQuery', true);

const dbOne = mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

// const dbTwo = mongoose.createConnection(process.env.DB_PATH2, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = { dbOne }