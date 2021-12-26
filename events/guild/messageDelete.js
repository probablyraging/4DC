const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const msgDelChan = client.channels.cache.get(process.env.MSGDEL_CHAN);

        if (message?.author.id === process.env.OWNER_ID || message?.author.bot) return;

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });

        const delLog = fetchedLogs.entries.first();
        const { executor } = delLog;

        const content = message?.content || ` `;

        const log = new Discord.MessageEmbed()
            .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
            .setColor("#E04F5F")
            .setDescription(`**A message was deleted**`)
            .addField("Author", `${message?.author}`, true)
            .addField("Channel", `${message?.channel}`, true)
            .addField('Message', `\`\`\`${content}\`\`\``)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        let msgAttachment = message?.attachments.size > 0 ? message?.attachments : null;

        if (msgAttachment) {
            log.setImage(msgAttachment.first().url).catch(err => console.error(`${path.basename(__filename)} There was a problem adding an image: `, err));
        }

        msgDelChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
    }
}