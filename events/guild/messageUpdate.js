const { MessageEmbed } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const { logToDatabase } = require('../dashboard/log_to_database');
const path = require('path');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage, client, Discord) {
        if (oldMessage?.author?.bot) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const msgUpChan = client.channels.cache.get(process.env.MSGUP_CHAN);

        let original = oldMessage?.content?.slice(0, 1000) + (oldMessage?.content?.length > 1000 ? '...' : '');
        let edited = newMessage?.content?.slice(0, 1000) + (newMessage?.content?.length > 1000 ? '...' : '');

        if (oldMessage?.cleanContent !== newMessage?.cleanContent) {
            var log = new Discord.MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor({ name: `${oldMessage?.author?.tag}`, iconURL: oldMessage?.author?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${newMessage?.url})`)
                .addField(`Author`, `${oldMessage?.author}`, true)
                .addField(`Channel`, `${oldMessage?.channel}`, true)
                .addField(`Old Message`, `\`\`\`${original}\`\`\``, false)
                .addField(`New Message`, `\`\`\`${edited}\`\`\``, false)
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()

            msgUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }

        /**
         * blacklists for when a message is updated/edited
         */
        // ------- same as bl_links.js
        const member = newMessage?.member;

        let found = false;

        if (newMessage?.deleted) return;

        for (var i in blacklist.links) {
            if (newMessage?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) found = true;
        }

        for (var e in blacklist.allChannels) {
            const reason = 'Blacklisted Link';
            const timestamp = new Date().getTime();

            if (found && newMessage?.channel.id === blacklist.allChannels[e]) {
                if (member?.id !== process.env.OWNER_ID && !newMessage?.author?.bot) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``
                    }).catch(() => {
                        newMessage?.reply({
                            content: `${process.env.BOT_DENY} \`Blacklisted link detected. You have been timedout for 30 seconds to prevent spamming\``,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    member?.timeout(30000, 'Blacklisted link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    logToDatabase(newMessage?.author?.id, newMessage?.author?.tag, newMessage?.channel.name, reason, msgContent, timestamp, reason);
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
            const reason = 'Contains Link';
            const timestamp = new Date().getTime();

            if (found && newMessage?.channel.id === blacklist.noLinkChannels[e] && !newMessage?.content.includes('tenor.com') && !newMessage?.author.bot) {
                if (member?.id !== process.env.OWNER_ID && !newMessage?.member?.roles?.cache.has(process.env.RANK5_ROLE) && !newMessage?.member?.roles?.cache.has(process.env.VERIFIED_ROLE)) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${newMessage?.channel.name}\``
                    }).catch(() => {
                        newMessage?.reply({
                            content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${newMessage?.channel.name}\``,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    logToDatabase(newMessage?.author?.id, newMessage?.author?.tag, newMessage?.channel.name, reason, msgContent, timestamp, reason);
                }
            }
        }
    }
}