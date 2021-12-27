const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../lists/blacklist');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    /**
     * This black list focuses on strict blacklisting in all channels for things like discord invites and onlyfans links 
     */
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);
    const muteChan = client.channels.cache.get(process.env.MUTES_CHAN);

    const member = message?.member;

    let found = false;

    for (var i in blacklist.links) {
        if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) found = true;
    }

    for (var e in blacklist.allChannels) {
        if (found && message?.channel.id === blacklist.allChannels[e]) {
            if (member?.id !== process.env.OWNER_ID && !message?.author?.bot) {
                member?.send({
                    content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``
                }).catch(() => {
                    message?.reply({
                        content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``,
                        deleteallowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    }).then(msg => {
                        setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                    });
                });

                setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                member?.timeout(30000, 'Blacklisted link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                const msgContent = message?.content.slice(0, 1000) + '...' || ` `;

                const blacklistEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                    .setColor('#E04F5F')
                    .addField(`Author`, `<@${message?.author?.id}>`, true)
                    .addField(`Channel`, `${message?.channel}`, true)
                    .addField(`Reason`, `Blacklisted link`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                    .setTimestamp()

                // const muteEmbed = new MessageEmbed()
                //     .setColor('#E04F5F')
                //     .setAuthor({ name: `${message?.author?.tag} has been auto timedout`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                //     .addField(`By:`, `${client.user}`, false)
                //     .addField(`Reason:`, `\`\`\`Blacklisted link detected - 30 second timeout\`\`\``, false)
                //     .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                //     .setTimestamp()

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                // muteChan.send({
                //     embeds: [muteEmbed]
                // }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }
}