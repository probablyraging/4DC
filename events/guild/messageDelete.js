const path = require('path');
const { ImgurClient } = require('imgur');

module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        if (message?.author.id === process.env.OWNER_ID || message?.author.bot) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const msgDelChan = client.channels.cache.get(process.env.MSGDEL_CHAN);        

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });

        const delLog = fetchedLogs.entries.first();

        let content = message?.content || ` `;
        if (message?.content.length > 1000) content = message?.content.slice(0, 1000) + '...' || ` `;

        const log = new Discord.MessageEmbed()
            .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
            .setColor("#E04F5F")
            .setDescription(`**A message was deleted**`)
            .addField("Author", `${message?.author}`, true)
            .addField("Channel", `${message?.channel}`, true)
            .addField('Message', `\`\`\`${content}\`\`\``)
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp()

        let msgAttachment = message?.attachments.size > 0 ? message?.attachments.first().url : null;

        if (msgAttachment) {
            // create a new imgur client
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            // upload attachment to imgur, get the link and attach it to the embed
            const response = await imgur.upload({
                image: msgAttachment,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            response.forEach(res => {
                log.setImage(res.data.link)
            });
        }

        msgDelChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
    }
}