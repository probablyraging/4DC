const { dbFind } = require('../../utils/utils');
const muteSchema = require('../../schemas/misc/mute_schema');
const path = require('path');

module.exports = async (member, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const results = await dbFind(muteSchema, { userId: member?.user.id });
    if (results.length === 0) return;
    for (const data of results) {
        // Fetch the channel to mute the user in
        const channel = await guild.channels.cache.get(data.channelId);
        // Update the channel permissions for the target user
        channel.permissionOverwrites.edit(data.userId, {
            SendMessages: false,
        }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
    }
}