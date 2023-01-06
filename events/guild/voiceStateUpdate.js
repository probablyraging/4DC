const { ChannelType } = require('discord.js')

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const vcHub = guild.channels.cache.get(process.env.VC_HUB);
        const vcCategory = guild.channels.cache.get(process.env.VC_CATEGORY);

        try {
            if (newState?.channelId === vcHub.id) {
                // When a user connects to the vc hub channel, create a unique voice channel with permissions
                guild.channels.create({
                    name: `${newState?.member?.displayName}'s VC`,
                    type: ChannelType.GuildVoice,
                    parent: vcCategory,
                    permissionOverwrites: [{
                        id: client.user.id,
                        allow: ['Connect', 'ViewChannel', 'ManageChannels', 'MoveMembers']
                    }, {
                        id: guild.id,
                        allow: ['Connect'],
                    }]
                }).then(newVoiceChannel => {
                    // Disallow the user from joining the hub again. This prevents creating multiple unique voice channels
                    vcHub.permissionOverwrites.edit(newState?.member, {
                        'Connect': false
                    });

                    // Move the user to the new voice channel
                    newState.member.voice.setChannel(newVoiceChannel);
                });
            } else if (newState?.channelId === null) {
                // Fetch and filter voice channels to see if anyone is in them
                const fetchedChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.id !== vcHub.id && c.members.size < 1);
                // Delete all the filtered voice channels
                for (const channel of fetchedChannels.values()) {
                    channel.delete();
                }
                // Allow the user to join the vc hub again
                vcHub.permissionOverwrites.delete(newState?.member);
            }
        } catch (err) {
            console.error('There was a problem with the voiceStateUpdate event :', err);
        }
    }
}