const introSchema = require('../../schemas/misc/intro_schema');
const { dbFindOne } = require('../../utils/utils');
const path = require('path');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);
        const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);
        const introChan = client.channels.cache.get(process.env.INTRO_CHAN);

        // If a user in the newUsers set leaves the server, we can remove them from the set (Extends from welcome_message.js)
        // if (newUsers.has(member.id)) newUsers.delete(member.id);
        // Delete a welcome message mentioning the newUser who left, if one was sent
        const generalMessages = await generalChan.messages.fetch({ limit: 10 });
        generalMessages.forEach(message => {
            if (message.mentions.members.size === 1 && message.mentions.has(member) && message.author.bot) {
                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        });

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_LEAVE} ${member} left. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // Remove user's introduction message if one exists
        const result = await dbFindOne(introSchema, { userId: member.id });
        if (result && result.messageId) {
            const introMessage = await introChan.messages.fetch(result.messageId).catch(() => { });
            if (introMessage) introMessage.delete();
        }
    }
}