const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = (message, client) => {
    /**
     * This blacklist focuses on strict blacklisting in all channels for things like discord invites, porn links and onlyfans links
     */
    if (message?.deleted) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);
    const premChan = client.channels.cache.get(process.env.PREM_CHAN);
    const staffChan = client.channels.cache.get(process.env.STAFF_CHAN);

    const member = message?.member;

    let found = false;
    let invite = false;
    let nitro = false;

    for (var i in blacklist.links) {
        if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) found = true;
        if (message?.content.toLowerCase().includes('discord.gg/') || message?.content.toLowerCase().includes('discord.com/invite')) invite = true;
    }

    for (var e in blacklist.allChannels) {
        if (found && message?.channel.id === blacklist.allChannels[e]) {
            if (member?.id !== process.env.OWNER_ID && !message?.author?.bot) {
                if (invite) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`Discord invite detected. You can only post Discord invites in ${premChan.name}\``
                    }).catch(() => {
                        message?.reply({
                            content: `${process.env.BOT_DENY} \`Discord invite detected. You can only post Discord invites in ${premChan.name}\``,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });
                } else {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``
                    }).catch(() => {
                        message?.reply({
                            content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });
                }

                setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                member?.timeout(30000, 'Blacklisted link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                let msgContent = message?.content || ` `;
                if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

                const blacklistEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                    .setColor('#E04F5F')
                    .addField(`Author`, `<@${message?.author?.id}>`, true)
                    .addField(`Channel`, `${message?.channel}`, true)
                    .addField(`Reason`, `Blacklisted link`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                    .setTimestamp()

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }

    /**
     * Nitro scam blacklist
     */
    if (!message?.content.toLowerCase().includes('https://discord.com/') &&
        message?.content.toLowerCase().includes('https://') && message?.content.toLowerCase().includes('nitro') ||
        message?.content.toLowerCase().includes('http://') && message?.content.toLowerCase().includes('nitro') ||
        message?.content.toLowerCase().includes('www.') && message?.content.toLowerCase().includes('nitro')) nitro = true;

    if (nitro) {
        member?.send({
            content: `${process.env.BOT_DENY} \`Nitro scam link detected. You have been timedout until a staff member can verify if this is a mistake or not\``
        }).catch(() => {
            message?.reply({
                content: `${process.env.BOT_DENY} \`Nitro scam link detected. You have been timedout until a staff member can verify if this is a mistake or not\``,
                allowedMentions: { repliedUser: true },
                failIfNotExists: false
            }).catch(err => {
                console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
            }).then(msg => {
                setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 10000);
            });
        });

        staffChan.send({
            content: `${message?.author} posted a link that looks like a Discord nitro scam. Please review the message in the deleted message log channel (if it exists) and ban them if neccassary`
        }).catch(err => {
            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
        });

        setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

        member?.timeout(86400 * 1000 * 7, 'Nitro scam link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

        let msgContent = message?.content || ` `;
        if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

        const blacklistEmbed = new MessageEmbed()
            .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
            .setColor('#E04F5F')
            .addField(`Author`, `<@${message?.author?.id}>`, true)
            .addField(`Channel`, `${message?.channel}`, true)
            .addField(`Reason`, `Blacklisted link`, true)
            .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp()

        blChan.send({
            embeds: [blacklistEmbed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
    }
}