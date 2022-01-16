const { Message, MessageEmbed } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const res = new (require('rss-parser'))();

const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This black list focuses on common "self-promo" type links like 'youtube.com' and 'twitch.tv'. We still allow these links to be posted in the "SELF PROMOTE" section and other specific channels. Users with the rank 5 or verified role are immune to this  
     */
    if (message?.deleted) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);

    const member = message?.member;

    let found = false;

    // TODO : remove below lines if checking if message.deleted works as expected
    // ignore links from the 'links' array to not cause double messages
    // for (var i in blacklist.links) {
    //     if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) return;
    // }

    // if a message contains a youtube channel url, get the channel id and see if the channel's name is the same os the author's
    // this is for the movies-tv-music and memes-and-media channel only, as they allow all ranks to post links unchecked
    if (message?.channel.id === process.env.MOVIE_CHAN || message?.channel.id === process.env.MEDIA_CHAN) {
        if (message?.content.toLowerCase().includes('youtube.com/channel/')) {
            function detectURLs(message) {
                var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
                return message.match(urlRegex)
            }

            const urlInStr = detectURLs(message?.content);
            const splitStr = urlInStr[0].split('/');
            const channelId = splitStr[splitStr.length - 1];

            try {
                const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)

                if (resolve && resolve.title === message?.author.username) {
                    member?.send({
                        content: `${process.env.BOT_DENY} \`You cannot post your own channel link in #${message?.channel.name}\``
                    }).catch(() => {
                        message?.reply({
                            content: `${process.env.BOT_DENY} \`You cannot post your own channel link in #${message?.channel.name}\``,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        }).then(msg => {
                            setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                        });
                    });

                    setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);
                }
            } catch { }
        }
    }

    for (var i in blacklist.promo) {
        if (message?.content.toLowerCase().includes(blacklist.promo[i].toLowerCase())) found = true;
    }

    for (var e in blacklist.noLinkChannels) {
        if (found && message?.channel.id === blacklist.noLinkChannels[e] && !message?.content.includes('tenor.com') && !message?.author.bot) {
            if (member?.id !== process.env.OWNER_ID && !message?.member?.roles?.cache.has(process.env.RANK5_ROLE) && !message?.member?.roles?.cache.has(process.env.VERIFIED_ROLE)) {
                member?.send({
                    content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${message?.channel.name}. You have been timedout for 30 seconds to prevent spamming\``
                }).catch(() => {
                    message?.reply({
                        content: `${process.env.BOT_DENY} \`You must be rank 5 to post links in #${message?.channel.name}. You have been timedout for 30 seconds to prevent spamming\``,
                        allowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    }).then(msg => {
                        setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
                    });
                });

                setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                member?.timeout(30000, 'Blacklisted link').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                let msgContent = message?.content || ` `;
                if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

                const blacklistEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message?.author?.tag}'s message was deleted`, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
                    .setColor('#E04F5F')
                    .addField(`Author`, `<@${message?.author?.id}>`, true)
                    .addField(`Channel`, `${message?.channel}`, true)
                    .addField(`Reason`, `Contains link`, true)
                    .addField(`Message`, `\`\`\`${msgContent}\`\`\``)
                    .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                    .setTimestamp()

                blChan.send({
                    embeds: [blacklistEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
            }
        }
    }
}