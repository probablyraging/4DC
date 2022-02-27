const { Message, MessageEmbed } = require('discord.js');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = (message, client) => {
    /**
     * This blacklist focuses on delting messages containing everyone and here pings
     */
    if (message?.member?.roles?.cache.has(process.env.STAFF_ROLE) || message?.deleted || message?.author.bot) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const member = message?.member;

    const contLow = message?.content.toLowerCase();

    const pingArr = ['@everyone', '@here'];

    for (var i in pingArr) {
        if (contLow.includes(pingArr[i])) {
                        
            member?.send({
                content: `${process.env.BOT_DENY} \`Everyone or Here ping detected. You have been timed out for 30 seconds\``
            }).catch(() => {
                message?.reply({
                    content: `${process.env.BOT_DENY} \`Everyone or Here ping detected. You have been timed out for 30 seconds\``,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                }).then(msg => {
                    setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 10000);
                });
            });

            setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

            let msgContent = message?.content || ` `;
            if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

            const blacklistEmbed = new MessageEmbed()
                .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                .setColor('#E04F5F')
                .addField(`Author`, `<@${message?.author?.id}>`, true)
                .addField(`Channel`, `${message?.channel}`, true)
                .addField(`Reason`, `Everyone or Here ping`, true)
                .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()

            blChan.send({
                embeds: [blacklistEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err))
        }
    }
}