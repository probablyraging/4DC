const { Message } = require('discord.js');
const chartData = require('../../schemas/database_logs/chart_data');
const linkCooldown = require('../../modules/misc/link_cooldown');
const ckqPost = require('../../modules/bump_ckq/ckq_post');
const bumpPost = require('../../modules/bump_ckq/bump_post');
const blLinks = require('../../modules/blacklist/bl_links');
const blPromo = require('../../modules/blacklist/bl_promo');
const blMass = require('../../modules/blacklist/bl_mass');
const blSpam = require('../../modules/blacklist/bl_spam');
const blPhishing = require('../../modules/blacklist/bl_phishing');
const blEveryone = require('../../modules/blacklist/bl_everyone');
const resPost = require('../../modules/misc/resource_post');
const lastLetter = require('../../modules/games/last_letter');
const countingGame = require('../../modules/games/counting_game');
const rankXP = require('../../modules/rank/rank_xp');
const creatorCrew = require("../../modules/creator_crew/check_new_post");
const path = require('path');

module.exports = {
    name: `messageCreate`,
    /**
     * @param {Message} message
     */
    async execute(message, client) {
        // blacklist checks
        linkCooldown(message, client);
        blPhishing(message, client);
        blPromo(message, client);
        // blWords(message, client);
        blLinks(message, client);
        blMass(message, client);
        blSpam(message, client);
        blEveryone(message, client);
        // blSub4Sub(message, client);

        // bump and ckq checks
        ckqPost(message);
        bumpPost(message);

        // game checks
        lastLetter(message, client);
        countingGame(message, client);

        // misc checks
        rankXP(message, client);
        creatorCrew(message, client);
        resPost(message, client);

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes("tweet")) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }

        // Database charts
        const nowTimestamp = new Date().valueOf();
        const tsToDate = new Date(nowTimestamp);
        const months = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateToUTC = tsToDate.getUTCDate() + ' ' + months[tsToDate.getUTCMonth()] + ' ' + tsToDate.getUTCFullYear();

        const results = await chartData.find({ date: dateToUTC });

        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '0',
                messages: '1'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { messages } = data;
                currentMessages = messages;
                currentMessages++;
                await chartData.findOneAndUpdate({
                    date: dateToUTC
                }, {
                    messages: currentMessages.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }
};
