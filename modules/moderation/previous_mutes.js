import { dbFind } from '../../utils/utils.js';
import muteSchema from '../../schemas/mute_schema.js';

export default async (member, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const results = await dbFind(muteSchema, { userId: member?.user.id });
    if (results.length === 0) return;
    for (const data of results) {
        // Fetch the channel to mute the user in
        const channel = await guild.channels.cache.get(data.channelId);
        // Update the channel permissions for the target user
        channel.permissionOverwrites.edit(data.userId, {
            SendMessages: false,
        }).catch(err => { return console.error('There was a problem editing a channel\'s permissions: ', err); });
    }
};