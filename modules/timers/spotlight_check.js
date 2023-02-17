const { dbFindOne, dbUpdateOne } = require('../../utils/utils');
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const spotlightChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
    const spotlightRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);
    const spotlightPingRole = guild.roles.cache.get(process.env.SPOTLIGHT_PING);

    setInterval(async () => {
        const results = await dbFindOne(timerSchema, { timer: 'spotlight' });
        const tenMinutes = 10 * 60 * 1000;

        if (results.timestamp && new Date() > (results.timestamp - tenMinutes)) {
            const fetchMessages = await spotlightChannel.messages.fetch();
            let pingSent = false;
            for await (const message of fetchMessages) {
                if (message.content.includes(process.env.SPOTLIGHT_PING)) {
                    pingSent = true;
                    break;
                }
            }
            if (!pingSent) spotlightChannel.send({
                content: `${spotlightPingRole} The channel will open soon`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        if (results.timestamp && new Date() > results.timestamp) {
            (await spotlightChannel.messages.fetch()).forEach(message => {
                if (message.content.includes(process.env.SPOTLIGHT_PING)) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                if (!message.author.bot) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            });

            await spotlightRole.members.each(member => {
                member.roles.remove(spotlightRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            });

            await spotlightChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

            await dbUpdateOne(timerSchema, { timer: 'spotlight' }, { timestamp: 'null' });
        }
    }, 10000);
};