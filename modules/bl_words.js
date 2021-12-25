const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../lists/blacklist');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const member = message?.member;
    const content = message?.content.toLowerCase().split(' ');

    for (var i in blacklist.words2) {
        if (message?.content.toLowerCase().includes(blacklist.words2[i].toLowerCase())) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
        return;
    }

    let found = false;

    for (var i in content) {
        if (content.includes(blacklist.words[i].toLowerCase())) found = true;
    }

    for (var e in blacklist.allChannels) {
        if (found && message?.channel.id === blacklist.allChannels[e]) {
            if (member?.id !== process.env.OWNER_ID && !message?.author?.bot) {
                member?.send({
                    content: `${process.env.BOT_DENY} \`Blacklisted word detected\``
                }).catch(() => {
                    message?.reply({
                        content: `${process.env.BOT_DENY} \`Blacklisted word detected\``,
                        deleteallowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).then(msg => {
                        setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                    });
                });

                setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                const msgContent = message?.content || ` `;

                const blacklistEmbed = new MessageEmbed()
                    .setAuthor(`${message?.author?.tag}'s message was deleted`, `${message?.author?.displayAvatarURL({ dynamic: true })}`)
                    .setColor('#E04F5F')
                    .addField(`Author`, `<@${message?.author?.id}>`, true)
                    .addField(`Channel`, `${message?.channel}`, true)
                    .addField(`Reason`, `Blacklisted word`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }
}