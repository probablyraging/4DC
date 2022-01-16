const mongoose = require('mongoose');

module.exports = async () => {
    await mongoose.connect(process.env.DB_PATH, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    return mongoose;
}