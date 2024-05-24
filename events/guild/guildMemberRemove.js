import introSchema from '../../schemas/intro_schema.js';
import { dbFindOne } from '../../utils/utils.js';

export default {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);
        const introChan = client.channels.cache.get(process.env.INTRO_CHAN);

        // Remove user's introduction message if one exists
        const result = await dbFindOne(introSchema, { userId: member.id });
        if (result && result.messageId) {
            const introMessage = await introChan.messages.fetch(result.messageId).catch(() => { });
            if (introMessage) introMessage.delete();
        }

        // Log to channel
        joinLeaveChan.send({
            content: `${process.env.BOT_LEAVE} ${member} left. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error('There was a problem sending a message: ', err));
    }
};