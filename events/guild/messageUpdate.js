const { EmbedBuilder } = require('discord.js');
const blacklist = require('../../lists/blacklist');
// const { logToDatabase } = require('../../modules/dashboard/log_to_database');
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
            var log = new Discord.EmbedBuilder()
                .setColor('#FF9E00')
                .setAuthor({ name: `${oldMessage?.author?.tag}`, iconURL: oldMessage?.author?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${newMessage?.url})`)
                .addFields({ name: `Author`, value: `${oldMessage?.author}`, inline: true },
                { name: `Channel`, value: `${oldMessage?.channel}`, inline: true },
                { name: `Old Message`, value: `\`\`\`${original}\`\`\``, inline: false },
                { name: `New Message`, value: `\`\`\`${edited}\`\`\``, inline: false })
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
        let reason = 'Blacklisted Link';
        const timestamp = new Date().getTime();

        let found = false;

        if (newMessage?.deleted) return;

        for (var i in blacklist.links) {
            if (newMessage?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) {
                if (i >= 0 && i <= 1) reason = 'Discord invite link';
                if (i >= 2 && i <= 4) reason = 'Adult content link';
                if (i >= 5 && i <= 13) reason = 'Shortened link';
                found = true;
            }
        }

        for (var e in blacklist.allChannels) {
            if (found && newMessage?.channel.id === blacklist.allChannels[e]) {
                if (member?.id !== process.env.OWNER_ID && !newMessage?.author?.bot) {
                    member?.send({
                        content: `${process.env.BOT_DENY} Blacklisted link detected. You have been timedout for 60 seconds to prevent spamming`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    member?.timeout(60000, `${reason}`).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    // logToDatabase(newMessage?.author?.id, newMessage?.author?.tag, newMessage?.channel.name, reason, msgContent, timestamp, reason);
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
                        content: `${process.env.BOT_DENY} You must be rank 5 to post links in #${newMessage?.channel.name}`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));

                    setTimeout(() => { newMessage?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    let msgContent = newMessage?.content || ` `;
                    if (newMessage?.content.length > 1000) msgContent = newMessage?.content.slice(0, 1000) + '...' || ` `;

                    logToDatabase(newMessage?.author?.id, newMessage?.author?.tag, newMessage?.channel.name, reason, msgContent, timestamp, reason);
                }
            }
        }
    }
}