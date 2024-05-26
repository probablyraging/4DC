// eslint-disable-next-line no-unused-vars
import { Message } from 'discord.js';
import linkCooldown from '../../modules/moderation/link_cooldown.js';
import bumpPost from '../../modules/misc/bump_post.js';
import blSpam from '../../modules/moderation/spam_filter.js';
import rankXP from '../../modules/misc/rank_xp.js';
import stickyMessage from '../../modules/misc/sticky_message.js';
import gptAssistant from '../../modules/misc/gpt_assistant.js';
import introductionCheck from '../../modules/moderation/log_introduction.js';
import boostReact from '../../modules/automation/boost_react.js';

const notifiedUsers = new Set();

export default {
    name: 'messageCreate',
    /**
     * @param {Message} message
     */
    async execute(message, client) {
        // Ignore DM messages
        if (message?.channel.type === 1) return;

        // Blacklist checks
        linkCooldown(message, client);
        blSpam(message, client);

        // Bump checks
        bumpPost(message, client);

        // Misc checks
        rankXP(message, client);
        // suggestionPost(message);
        stickyMessage(message, client);
        gptAssistant(message);
        introductionCheck(message);
        boostReact(message);

        // Block all youtube video links from being posted in the introduction channel
        if (message?.channel.id === process.env.INTRO_CHAN && !message?.author.bot) {
            if (message?.content.includes('youtu.be/') || message?.content.includes('youtube.com/watch')) {
                message?.delete().catch(err => console.error('There was a problem deleting a message: ', err));
            } else {
                message?.react('👋').catch(err => console.error('There was a problem deleting a message: ', err));
            }
        }

        // Check automod embeds for Discord links and send the user a notification
        if (message?.channel.id === process.env.AUTOMOD_CHAN && message.type === 24) {
            if (notifiedUsers.has(message?.author.id)) return;
            if (message?.embeds[0].description.toLowerCase().includes('discord.com/invite') || message?.embeds[0].description.toLowerCase().includes('discord.gg/')) {
                message?.author.send({
                    content: 'Discord invite link sharing is only available to server boosters',
                    files: ['./res/images/supporter_rewards.png'],
                }).catch(err => console.error('There was a problem sending a message: ', err));
                notifiedUsers.add(message?.author.id);
            } else {
                message?.embeds[0].fields.forEach(field => {
                    if (field.value.toLowerCase() === 'self promotion') {
                        message?.author.send({
                            content: `Content sharing is only available to server boosters in the <#${process.env.SUPPORTER_CHAN}> channel`,
                            files: ['./res/images/supporter_rewards.png'],
                        }).catch(err => console.error('There was a problem sending a message: ', err));
                        notifiedUsers.add(message?.author.id);
                    }
                });
            }
        }

        // Resend followed server messages, delete the original message and resend it
        if (message?.channel.id === process.env.NEWS_CHAN && message.author.id === '900247274792304710') {
            setTimeout(async () => {
                const fetchedMessage = await message.channel.messages.fetch(message.id).catch(err => console.error('There was a problem fetching a message: ', err));
                fetchedMessage.delete().catch(err => console.error('There was a problem deleting a message: ', err));
                message.channel.send({
                    content: fetchedMessage.embeds[0]?.url,
                }).catch(err => console.error('There was a problem sending a message: ', err));
            }, 3000);
        }

        // Users must be in the server for 3 days before they can post promo links in the media channels
        const promoLinks = ['youtube.com/', 'youtu.be/', 'twitch.tv/', 'facebook.com/', 'instagram.com/', 'spotify.com/', 'tiktok.com/', 'twitter.com/'];
        const oneDay = 24 * 3 * 60 * 60 * 1000;
        if (message?.channel.id === process.env.MEDIA_CHAN && !message?.author.bot && (new Date() - message?.member.joinedTimestamp) < oneDay) {
            for (const i in promoLinks) {
                if (message?.content.includes(promoLinks[i])) {
                    message.delete().catch(err => console.error('There was a problem deleting a message: ', err));
                }
            }
        }
    },
};
