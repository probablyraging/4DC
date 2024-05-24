import { dbFindOne, dbCreate } from '../../utils/utils.js';
import introSchema from '../../schemas/intro_schema.js';

export default async (message) => {
    // Check if a user has already made an introduction post
    if (message?.channel.id === process.env.INTRO_CHAN && !message?.member.permissions.has(process.env.STAFF_ROLE) && !message?.author.bot) {
        try {
            const result = await dbFindOne(introSchema, { userId: message?.author.id });
            // Create a new entry if no previous post was foound
            if (!result) await dbCreate(introSchema, { userId: message?.author.id, messageId: message?.id });
            // Delete the user's message if a previous post was found
            if (result) message?.delete();
        } catch (err) {
            console.error('There was a problem logging an introduction: ', err);
        }
    }
};