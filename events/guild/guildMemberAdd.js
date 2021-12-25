const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChannel = client.channels.cache.get(process.env.BOT_CHAN);
        const seasonRole = guild.roles.cache.get(process.env.SEASON_ROLE);
        
        const memberCount = guild.memberCount;

        const response = new MessageEmbed()
            .setColor('#32BEA6')
            .setAuthor(`${member?.user.tag}`, `${member?.user.displayAvatarURL({ dynamic: true })}`)
            .setDescription(`${member} joined

There are now **${memberCount}** members in the server`)
            .setThumbnail(`${member?.user.displayAvatarURL({ dynamic: true })}`)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        joinLeaveChannel.send({
            embeds: [response]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

        setTimeout(() => {
            member?.roles.add(divRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        }, 300000);
    }
}