const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = (message, client) => {
    /**
     * This blacklist focuses on deleting specific blacklisted waords
     */
    if (message?.deleted) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const member = message?.member;

    const content = message?.content.toLowerCase().split(' ');

    for (var i in blacklist.words2) {
        if (blacklist.words2.includes(message?.content.toLowerCase())) {
            return message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }        
    }

    let found = false;

    for (var e in blacklist.words) {
        if (blacklist.words.includes(content[e])) found = true;
    }

    for (var e in blacklist.allChannels) {
        if (found && message?.channel.id === blacklist.allChannels[e]) {
            if (member?.id !== process.env.OWNER_ID && !message?.author?.bot) {
                member?.send({
                    content: `${process.env.BOT_DENY} \`Blacklisted word detected\``
                }).catch(() => {
                    message?.reply({
                        content: `${process.env.BOT_DENY} \`Blacklisted word detected\``,
                        allowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    }).then(msg => {
                        setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
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
                    .addField(`Reason`, `Blacklisted word`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }
}