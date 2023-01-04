const { CommandInteraction } = require('discord.js');

/**
 * Send a response to an interaction
 * @param {CommandInteraction} interaction - The interaction object
 * @param {string} content The content of the response
 * @param {Array} embeds An array of embeds
 * @param {Array} files An array of files
 * @param {Array} components An array of components
 */
async function sendResponse(interaction, content = '', embeds = [], files = [], components = []) {
    try {
        return interaction.editReply({
            content: content,
            embeds: embeds,
            files: files,
            components: components,
            ephemeral: true
        });
    } catch (err) {
        console.error(`There was a problem sending an interaction: `, err);
    }
}

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

/**
 * Deletes a single document in a MongoDB collection 
 * @param {Object} model The Mongoose model
 * @param {Object} filter The filter object to identify the document to delete
 */
async function dbDeleteOne(model, filter) {
    try {
        await model.deleteOne(filter);
    } catch (err) {
        return console.error(`There was a problem updating a database entry: `, err);
    }
}

module.exports = {
    sendResponse,
    dbCreate,
    dbUpdateOne,
    dbDeleteOne
}