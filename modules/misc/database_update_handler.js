/**
 * Creates a single document in a MongoDB collection 
 * @param {Object} model The Mongoose model
 * @param {Object} update The update object to specify the changes to be made to the document
 */
 async function dbCreate(model, update) {
    try {
        await model.create(update);
    } catch (err) {
        return console.error(`There was a problem updating a database entry: `, err);
    }
}

/**
 * Updates a single document in a MongoDB collection 
 * @param {Object} model The Mongoose model
 * @param {Object} filter The filter object to identify the document to update
 * @param {Object} update The update object to specify the changes to be made to the document
 */
 async function dbUpdateOne(model, filter, update) {
    try {
        await model.updateOne(filter, update, { upsert: true });
    } catch (err) {
        return console.error(`There was a problem updating a database entry: `, err);
    }
}

module.exports = {
    dbCreate,
    dbUpdateOne
}

// const { dbCreate, dbUpdateOne } = require('../../../modules/misc/database_update_handler');