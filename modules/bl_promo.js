const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../lists/blacklist');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    /**
     * This black list focuses on common "self-promo" type links like 'youtube.com' and 'twitch.tv'. We still allow these links to be
     * posted in the "SELF PROMOTE" section and other specific channels. Users with the rank 5 or verified role are immune to this  
     */
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const member = message?.member;

    let found = false;

    // ignore links from the 'links' array to not cause double messages
    for (var i in blacklist.links) {
        if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) return;
    }

    for (var i in blacklist.promo) {
        if (message?.content.toLowerCase().includes(blacklist.promo[i].toLowerCase())) found = true;
    }

    for (var e in blacklist.noLinkChannels) {
        if (found && message?.channel.id === blacklist.noLinkChannels[e] && !message?.content.includes('tenor.com') && !message?.author.bot) {
            if (member?.id !== process.env.OWNER_ID && !message?.member?.roles?.cache.has(process.env.RANK5_ROLE)) {
                member?.send({
                    content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${message?.channel.name}\``
                }).catch(() => {
                    message?.reply({
                        content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${message?.channel.name}\``,
                        deleteallowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    }).then(msg => {
                        setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                    });
                });

                setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                const msgContent = message?.content || ` `;

                const blacklistEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                    .setColor('#E04F5F')
                    .addField(`Author`, `<@${message?.author?.id}>`, true)
                    .addField(`Channel`, `${message?.channel}`, true)
                    .addField(`Reason`, `Contains link`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                    .setTimestamp()

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }
}