const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const botRole = guild.roles.cache.get(process.env.BOT_ROLE);

        if (newState?.channelId === process.env.VC_HUB) {
            newState?.guild.channels.create(`${newState?.member?.displayName}'s VC`, {
                type: 'GUILD_VOICE',
                permissionOverwrites: [{
                    id: guild.id,
                    allow: ['CONNECT'],
                }]
            }).then(vc => {
                vc.permissionOverwrites.edit(botRole, {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: true,
                    CONNECT: true,
                    MOVE_MEMBERS: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                vc.permissionOverwrites.edit(newState?.member, {
                    VIEW_CHANNEL: true,
                    CONNECT: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a voice channel's permissions: `, err));

                let category = newState.guild.channels.cache.find(c => c.id === process.env.VC_CATEGORY && c.type === 'GUILD_CATEGORY');

                voiceChannel = vc.id
                vcChannel = vc

                setTimeout(() => vc.setParent(process.env.VC_CATEGORY, { lockPermissions: false }), 500);

                newState?.member?.voice.setChannel(voiceChannel).catch(err => console.error(`${path.basename(__filename)} There was a problem setting a voice channel: `, err));
            });
        }
        else if (newState?.channelId === null) {
            const fetchedChannel = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.id !== process.env.VC_HUB && c.id !== process.env.VC_ONLINE && c.id !== process.env.VC_TOTAL && c.members.size < 1);

            fetchedChannel.forEach(channel => {
                channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a voice channel: `, err));
            });
        }
    }
}