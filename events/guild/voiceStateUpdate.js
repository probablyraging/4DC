const path = require('path');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const botRole = guild.roles.cache.get(process.env.BOT_ROLE);
        const vcHub = guild.channels.cache.get(process.env.VC_HUB);

        if (newState?.channelId === process.env.VC_HUB) {
            // when a user connects to the vc_hub channel, create a unique vc channel with permissions
            newState?.guild.channels.create(`${newState?.member?.displayName}'s VC`, {
                type: 'GUILD_VOICE',
                permissionOverwrites: [{
                    id: guild.id,
                    allow: ['CONNECT'],
                }]
            }).then(vc => {
                // give the bot the permissions it needs
                vc.permissionOverwrites.edit(botRole, {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: true,
                    CONNECT: true,
                    MOVE_MEMBERS: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                // allow the user to be able to connect (be moved to)
                vc.permissionOverwrites.edit(newState?.member, {
                    VIEW_CHANNEL: true,
                    CONNECT: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                // disallow the user from join the hub again. this prevents creating multiple unique vc channels
                vcHub.permissionOverwrites.edit(newState?.member, {
                    CONNECT: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                // move the user's unique channel to the vc category and we wait .5 seconds for good measure
                let category = newState.guild.channels.cache.find(c => c.id === process.env.VC_CATEGORY && c.type === 'GUILD_CATEGORY');

                voiceChannel = vc.id
                vcChannel = vc

                setTimeout(() => vc.setParent(process.env.VC_CATEGORY, { lockPermissions: false }), 500);

                // move the user to their new unique channel
                newState?.member?.voice.setChannel(voiceChannel).catch(err => console.error(`${path.basename(__filename)} There was a problem moving a user to a voice channel: `, err));
            });
        }
        else if (newState?.channelId === null) {
            // fetch and filter vc channels to see if anyone is in them, if not, we can delete them
            const fetchedChannel = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.id !== process.env.VC_HUB && c.id !== process.env.VC_ONLINE && c.id !== process.env.VC_TOTAL && c.members.size < 1);

            fetchedChannel.forEach(channel => {
                channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a voice channel: `, err));
            });

            // reallow the user to join the vc_hub again
            vcHub.permissionOverwrites.edit(newState?.member, {
                CONNECT: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));
        }
    }
}