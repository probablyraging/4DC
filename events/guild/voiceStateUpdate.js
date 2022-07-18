const { ChannelType, PermissionFlagsBits } = require('discord.js')
const path = require('path');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const botRole = guild.roles.cache.get(process.env.BOT_ROLE);
        const vcHub = guild.channels.cache.get(process.env.VC_HUB);
        
        if (newState?.channelId === process.env.VC_HUB) {
            // when a user connects to the vc_hub channel, create a unique vc channel with permissions
            guild.channels.create({
                name: `${newState?.member?.displayName}'s VC`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{
                    id: client.user.id,
                    allow: ['Connect', 'ViewChannel', 'ManageChannels', 'MoveMembers']
                }, {
                    id: guild.id,
                    allow: ['Connect'],
                }]
            }).then(vc => {
                // disallow the user from joining the hub again. this prevents creating multiple unique vc channels
                vcHub.permissionOverwrites.edit(newState?.member, {
                    'Connect': false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                setTimeout(() => vc.setParent(process.env.VC_CATEGORY, { lockPermissions: false }), 500);

                // move the user to their new unique channel
                newState?.member?.voice.setChannel(vc.id).catch(err => console.error(`${path.basename(__filename)} There was a problem moving a user to a voice channel: `, err));
            });
        } else if (newState?.channelId === null) {
            // fetch and filter vc channels to see if anyone is in them, if not, we can delete them
            const fetchedChannel = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.id !== process.env.VC_HUB && c.id !== process.env.VC_ONLINE && c.id !== process.env.VC_TOTAL && c.members.size < 1);

            fetchedChannel.forEach(channel => {
                channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a voice channel: `, err));
            });

            // allow the user to join the vc hub again
            vcHub.permissionOverwrites.delete(newState?.member).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));
        }
    }
}