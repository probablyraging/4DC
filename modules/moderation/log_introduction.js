const { dbFindOne, dbCreate } = require('../../utils/utils');
const introSchema = require('../../schemas/misc/intro_schema');

module.exports = async (message) => {
    // Check if a user has already made an introduction post
    if (message?.channel.id === process.env.INTRO_CHAN && !message?.member.permissions.has(process.env.STAFF_ROLE) && !message?.author.bot) {
        try {
            const result = await dbFindOne(introSchema, { userId: message?.author.id });
            // Create a new entry if no previous post was foound
            if (!result) await dbCreate(introSchema, { userId: message?.author.id, messageId: message?.id });
            // Delete the user's message if a previous post was found
            if (result) message?.delete();
        } catch (err) {
            console.error(`There was a problem logging an introduction: `, err);
        }
    }
}