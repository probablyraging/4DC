const { Message } = require('discord.js');
const cooldown = new Set();
const path = require('path');
/**
 * 
 * @param {Message} message 
 */

module.exports = (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const author = message?.author;
    const content = message?.content.toLocaleLowerCase();
    const conditions = ['https://', 'http://', 'www.'];
    const check = conditions.some(el => content.includes(el));

    if (!author) {
        return;
    } else {
        if (check && !message?.member?.permissions.has("MANAGE_MESSAGES") && !message?.member?.roles.cache.has(process.env.RANK5_ROLE) && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE) && !message?.author?.bot) {
            if (cooldown.has(message?.author?.id)) {
                const response = `${process.env.BOT_DENY} \`You're sending links too fast. Please wait 30 seconds\``;
                let messageId = message?.id;

                author?.send({
                    content: `${response}`,
                }).catch(() => {
                    message?.reply({
                        content: `${response}`,
                        deleteallowedMentions: { repliedUser: true }
                    }).catch(() => {
                        message?.reply({
                            content: `${response}`,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                            .then(msg => setTimeout(() => {
                                msg?.delete().catch(err => console.error(`${path.basename(__filename)} 1 There was a problem deleting a message: `, err));
                            }, 4000));
                    }).then(msg => setTimeout(() => {
                        msg?.delete().catch(err => console.error(`${path.basename(__filename)} 2 There was a problem deleting a message: `, err));
                    }, 4000));
                }).then(() => {
                    setTimeout(() => {
                        message?.delete().catch(err => console.error(`${path.basename(__filename)} 3 ### THIS IS EXPECTED SOME TIMES: `, err));
                    }, 600);

                    let msgContent = message?.content || ` `;
                    if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

                    const log = new Discord.MessageEmbed()
                        .setColor('#fc3c3c')
                        .setAuthor({ name: `${message?.author?.tag}`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                        .addField("Author", `<@${message?.author?.id}>`, true)
                        .addField("Channel", `${message?.channel}`, true)
                        .addField("Reason", `Link cooldown`, true)
                        .addField('Message', `\`\`\`${msgContent}\`\`\``)
                        .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                        .setTimestamp()

                    blChan.send({
                        embeds: [log]
                    }).catch(err => console.error(`${path.basename(__filename)} 2 There was a problem sending a log: `, err));
                });
            } else {
                cooldown.add(message?.author.id)

                setTimeout(() => {
                    cooldown.delete(message?.author.id)
                }, 30000);
            }
        }
    }
}