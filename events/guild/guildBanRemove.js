const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'guildBanRemove',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);        
        const banChan = client.channels.cache.get(process.env.BAN_CHAN);

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_REMOVE',
            });

            const banLog = fetchedLogs.entries.first();
            const { executor } = banLog;

            const response = new Discord.MessageEmbed()
                .setColor('#32BEA6')
                .setAuthor(`${ban?.user?.tag} has been unbanned`, `${ban?.user?.displayAvatarURL({ dynamic: true })}`)
                .addField(`Unbanned By`, `${executor}`, true)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            banChan.send({
                embeds: [response]
            })
        }, 2000);
    }
}