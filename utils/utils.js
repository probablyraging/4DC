const { CommandInteraction } = require('discord.js');
const attachmentMap = new Map();

/**
 * Edit the reply to an interaction
 * @param {CommandInteraction} interaction - The interaction object
 * @param {string} content The content of the response
 * @param {Array} embeds An array of embeds
 * @param {Array} files An array of files
 * @param {Array} components An array of components
 */
async function sendResponse(interaction, content = '', embeds = [], files = [], components = [], ephemeral = true) {
    try {
        return interaction.editReply({
            content: content,
            embeds: embeds,
            files: files,
            components: components,
            ephemeral: ephemeral
        });
    } catch (err) {
        console.error(`There was a problem editing an interaction: `, err);
    }
}

/**
 * Send a reply to an interaction
 * @param {CommandInteraction} interaction - The interaction object
 * @param {string} content The content of the response
 * @param {Array} embeds An array of embeds
 * @param {Array} files An array of files
 * @param {Array} components An array of components
 */
async function sendReply(interaction, content = '', embeds = [], files = [], components = [], ephemeral = true) {
    try {
        return interaction.reply({
            content: content,
            embeds: embeds,
            files: files,
            components: components,
            ephemeral: ephemeral
        });
    } catch (err) {
        console.error(`There was a problem replying to an interaction: `, err);
    }
}

/**
 * Creates a single document in a MongoDB collection 
 * @param {Object} model The Mongoose model
 * @param {Object} filter The update object to specify the changes to be made to the document
 * @returns {Object|Error} The result of the query or an error
 */
async function dbFind(model, filter = {}) {
    try {
        const result = await model.find(filter);
        return result;
    } catch (err) {
        return console.error(`There was a problem finding a database entry: `, err);
    }
}

/**
 * Creates a single document in a MongoDB collection 
 * @param {Object} model The Mongoose model
 * @param {Object} filter The update object to specify the changes to be made to the document
 * @returns {Object|Error} The result of the query or an error
 */
async function dbFindOne(model, filter) {
    try {
        const result = await model.findOne(filter);
        return result;
    } catch (err) {
        return console.error(`There was a problem finding one database entry: `, err);
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
        return console.error(`There was a problem creating a database entry: `, err);
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
        return console.error(`There was a problem updating one database entry: `, err);
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
        return console.error(`There was a problem deleting a database entry: `, err);
    }
}

/**
 * Adds a URL to a key in an attachment map
 * @param {string} key The key to store the URL at
 * @param {string} url The URL to store
 */
function addAttachment(key, url) {
    attachmentMap.set(key, url);
}

/**
 * Gets the URL stored at a given key in an attachment map and removes it from the map.=
 * @param {string} key The key to get the URL for
 * @returns {string} The URL stored at the given key
 */
function getAttachment(key) {
    let attachment = attachmentMap.get(key);
    attachmentMap.delete(key);
    return attachment;
}

module.exports = {
    sendResponse,
    sendReply,
    dbFind,
    dbFindOne,
    dbCreate,
    dbUpdateOne,
    dbDeleteOne,
    addAttachment,
    getAttachment
}