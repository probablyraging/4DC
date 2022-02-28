const { Message } = require('discord.js');
const path = require('path');
const linkCooldown = require('../../modules/misc/link_cooldown');
const ckqPost = require('../../modules/bump_ckq/ckq_post');
const bumpPost = require('../../modules/bump_ckq/bump_post');
const blLinks = require('../../modules/blacklist/bl_links');
const blPromo = require('../../modules/blacklist/bl_promo');
const blMass = require('../../modules/blacklist/bl_mass');
const blWords = require('../../modules/blacklist/bl_words');
const blTwitch = require('../../modules/blacklist/bl_twitch');
const blSpam = require('../../modules/blacklist/bl_spam');
const blPhishing = require('../../modules/blacklist/bl_phishing');
const blEveryone = require('../../modules/blacklist/bl_everyone');
const blSub4Sub = require('../../modules/blacklist/bl_sub4sub');
const resPost = require('../../modules/misc/resource_post');
const lastLetter = require('../../modules/games/last_letter');
const countingGame = require('../../modules/games/counting_game');
const rankXP = require('../../modules/rank/rank_xp');
const modsChoice = require("../../modules/mods_choice/mods_choice_messages");

module.exports = {
    name: `messageCreate`,
    /**
     * @param {Message} message
     */
    async execute(message, client, Discord) {

        linkCooldown(message, client, Discord);
        blLinks(message, client, Discord);
        blPromo(message, client, Discord);
        blMass(message, client, Discord);
        blWords(message, client, Discord);
        blTwitch(message, client, Discord);
        blSpam(message, client, Discord);
        blPhishing(message, client);
        blEveryone(message, client);
        blSub4Sub(message, client);
        ckqPost(message);
        bumpPost(message, client, Discord);
        resPost(message, client, Discord);
        lastLetter(message, client, Discord);
        countingGame(message, client);
        rankXP(message, client, Discord);
        modsChoice(message, client);

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes("tweet")) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }

        // remind people to use /rank command
        if (message?.channel?.id === process.env.BOT_CHAN && message?.content?.toLowerCase().includes("!rank")) {
            message?.reply({
                content: `${process.env.BOT_DENY} \`Please use /rank instead\``
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }, 5000);
                });
            setTimeout(() => {
                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }, 100);
        }

        // NOTE : this can be deleted when this kid stops annoying us lol
        // check if the video author is ROVB
        function detectURLs(message) {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            return message.match(urlRegex)
        }

        if (message?.content?.toLowerCase().includes('youtube.com/watch') || message?.content?.toLowerCase().includes('youtu.be/')) {
            const urlInStr = detectURLs(message?.content) || [`https://${message?.content}`];
            const replace = urlInStr[0].replace('www.', '');

            try {
                const resolve = await fetch(`https://www.youtube.com/oembed?url=${replace}&format=json`);
                const response = await resolve.json();

                // send the little shit a message
                if (response && response.author_name.toLowerCase() === "rovb") {
                    message?.member?.send({
                        content: `${process.env.BOT_DENY} \`Nobody cares mate, go outside and play or do something productive instead\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))

                    // delete his message
                    setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

                    // ban him :D
                    message?.member.ban({ days: 0, reason: 'Kid needs a life' }).catch(err => console.error(`${path.basename(__filename)} There was a problem banning a user: `, err));
                }
            } catch { }
        }
    }
};
