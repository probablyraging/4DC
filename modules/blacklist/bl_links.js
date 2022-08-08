const { Message, EmbedBuilder } = require('discord.js');
const blacklist = require('../../lists/blacklist');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This blacklist focuses on strict blacklisting in all channels for things like discord invites, porn links and onlyfans links
     */
    if (message?.deleted) return;
    const premChan = client.channels.cache.get(process.env.PREM_CHAN);
    let reason = 'Blacklisted Link';
    const timestamp = new Date().getTime();

    const member = message?.member;

    let found = false;
    let invite = false;

    for (var i in blacklist.links) {
        if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) {
            if (i >= 0 && i <= 1) reason = 'Discord invite link';
            if (i >= 2 && i <= 4) reason = 'Adult content link';
            if (i >= 5 && i <= 13) reason = 'Shortened link';
            found = true;
        }
        if (message?.content.toLowerCase().includes('discord.gg/') || message?.content.toLowerCase().includes('discord.com/invite')) invite = true;
    }

    for (var e in blacklist.allChannels) {
        if (found && message?.channel.id === blacklist.allChannels[e] || found && message?.channel.parentId === blacklist.allChannels[e]) {
            if (member?.id !== process.env.OWNER_ID && !message?.author?.bot) {
                if (invite) {
                    member?.send({
                        content: `${process.env.BOT_DENY} Discord invite detected. You can only post Discord invites in #${premChan.name}`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
                } else {
                    member?.send({
                        content: `${process.env.BOT_DENY} Blacklisted link detected. You have been timedout for 60 seconds to prevent spamming`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
                }

                setTimeout(() => {
                    // If channel is a thread, we delete the entire thread
                    if (message?.author.id === message?.channel.ownerId) {
                        message?.channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a thread channel: `, err))
                    } else {
                        message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err))
                    }
                }, 600);

                member?.timeout(60000, `${reason}`).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));
                
                let msgContent = message?.content || ` `;
                if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;
                await sleep(300);
            }
        }
    }
}