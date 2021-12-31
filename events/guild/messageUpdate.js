const { MessageEmbed } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const path = require('path');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const msgUpChan = client.channels.cache.get(process.env.MSGUP_CHAN);

        let original = oldMessage.content.slice(0, 1000) + (oldMessage.content.length > 1000 ? '...' : '');
        let edited = newMessage.content.slice(0, 1000) + (newMessage.content.length > 1000 ? '...' : '');

        if (oldMessage?.cleanContent !== newMessage?.cleanContent) {
            var log = new Discord.MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor({ name: `${oldMessage?.author.tag}`, iconURL: oldMessage?.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${newMessage?.url})`)
                .addField(`Author`, `${oldMessage?.author}`, true)
                .addField(`Channel`, `${oldMessage?.channel}`, true)
                .addField(`Old Message`, `\`\`\`${original}\`\`\``, false)
                .addField(`New Message`, `\`\`\`${edited}\`\`\``, false)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            msgUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }

        /**
         * blacklists for when a message is updated/edited
         */
        // ------- same as bl_links.js
        const blChan = client.channels.cache.get(process.env.BL_CHAN);
        const member = newMessage?.member;

        let found = false;

        if (newMessage?.deleted) return;

        for (var i in blacklist.links) {
            if (newMessage?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) found = true;
        }

        for (var e in blacklist.allChannels) {
            if (found && newMessage?.channel.id === blacklist.allChannels[e]) {
                if (member?.id !== process.env.OWNER_ID && !newMessage?.author?.bot) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``
                    }).catch(() => {
                        newMessage?.reply({
                            content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    member?.timeout(30000, 'Blacklisted link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    const blacklistEmbed = new MessageEmbed()
                        .setAuthor({ name: `${newMessage?.user?.tag}'s message was deleted`, iconURL: newMessage?.user?.displayAvatarURL({ dynamic: true }) })
                        .setColor('#E04F5F')
                        .addField(`Author`, `<@${newMessage?.author?.id}>`, true)
                        .addField(`Channel`, `${newMessage?.channel}`, true)
                        .addField(`Reason`, `Blacklisted link`, true)
                        .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                        .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                        .setTimestamp()

                    blChan.send({
                        embeds: [blacklistEmbed]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
                }
            }
        }

        // ------- same as bl_promo.js
        // ignore links from the 'links' array to not cause double messages
        for (var i in blacklist.links) {
            if (newMessage?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) return;
        }

        for (var i in blacklist.promo) {
            if (newMessage?.content.toLowerCase().includes(blacklist.promo[i].toLowerCase())) found = true;
        }

        for (var e in blacklist.noLinkChannels) {
            if (found && newMessage?.channel.id === blacklist.noLinkChannels[e] && !newMessage?.content.includes('tenor.com') && !newMessage?.author.bot) {
                if (member?.id !== process.env.OWNER_ID && !newMessage?.member?.roles?.cache.has(process.env.RANK5_ROLE) && !newMessage?.member?.roles?.cache.has(process.env.VERIFIED_ROLE)) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${newMessage?.channel.name}\``
                    }).catch(() => {
                        newMessage?.reply({
                            content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${newMessage?.channel.name}\``,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    const blacklistEmbed = new MessageEmbed()
                        .setAuthor({ name: `${newMessage?.author.tag}'s message was deleted`, iconURL: newMessage?.author.displayAvatarURL({ dynamic: true }) })
                        .setColor('#E04F5F')
                        .addField(`Author`, `<@${newMessage?.author?.id}>`, true)
                        .addField(`Channel`, `${newMessage?.channel}`, true)
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
}