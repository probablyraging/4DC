const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);        
        const banChan = client.channels.cache.get(process.env.BAN_CHAN);

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            const banLog = fetchedLogs.entries.first();
            const { executor, reason } = banLog;

            const response = new MessageEmbed()
                .setColor('#E04F5F')
                .setAuthor(`${ban?.user?.tag} has been banned`, `${ban?.user?.displayAvatarURL({ dynamic: true })}`)
                .addField(`Banned By`, `${executor}`, true)
                .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            banChan.send({
                embeds: [response]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }, 2000);
    }
}