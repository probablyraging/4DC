const { EmbedBuilder } = require('discord.js');
const { dbUpdateOne, dbDeleteOne } = require('../../utils/utils');
const rankSchema = require('../../schemas/misc/rank_schema');
const warnSchema = require('../../schemas/misc/warn_schema');
const lastLetterSchema = require('../../schemas/letter_game/letter_lb_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const inviteSchema = require('../../schemas/misc/invite_schema');
const cronjob = require('cron').CronJob;
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Fetch all rank entries sorted in descending order based on their 'xp', remove non-existent users and assign their new rank position - runs once per day (12:00)
    const rankSort = new cronjob('0 12 * * *', async function () {
        const results = await rankSchema.find().sort({ xp: -1 });
        let currentPosition = 0;
        let newPositionArr = [];
        for (const data of results) {
            const { userId } = data;
            // Remove non-existent users from the database
            currentPosition++;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the rank system that no longer exists`));
            if (!exists) await dbDeleteOne(rankSchema, { userId: userId });
            // Set each user's current rank position
            newPositionArr.push({ pos: currentPosition, userId: userId });
        }
        // Assign the new rank position to each user
        for (let i = 0; i < newPositionArr.length; i++) {
            await dbUpdateOne(rankSchema, { userId: newPositionArr[i].userId }, { rank: newPositionArr[i].pos });
        }
    });

    // Fetch all warnings and remove non-existent users - runs once per month, on the first day of the month (Monday 00:00)
    const warnsCheck = new cronjob('0 0 1 * *', async function () {
        const results = await warnSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
            if (!exists) await dbDeleteOne(warnSchema, { userId: userId });
        }
    });

    // Fetch all last letter entries and remove non-existent users - runs once per week (Tuesday 00:00)
    const lastLetterCheck = new cronjob('0 0 * * 2', async function () {
        const results = await lastLetterSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the last letter collection that no longer exists`));
            if (!exists) await dbDeleteOne(lastLetterSchema, { userId: userId });
        }
    });

    // Fetch all counting game entries and remove non-existent users - runs once per week (Wednesday 00:00)
    const countingCheck = new cronjob('0 0 * * 3', async function () {
        const results = await countingSchema.find();
        for (const data of results) {
            const { userId } = data;
            // Ignore the entry for the guild saves
            if (userId === process.env.GUILD_ID) return;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the counting collection that no longer exists`));
            if (!exists) await dbDeleteOne(countingSchema, { userId: userId });
        }
    });

    // Check for expired premium ads and send a notification
    const premiumAdsCheck = new cronjob('0 */6 * * *', async function () {
        const testChan = guild.channels.cache.get(process.env.TEST_CHAN);
        const premiumChan = await guild.channels.fetch('907446635435540551');
        const premiumAds = await premiumChan.messages.fetch();

        premiumAds.forEach(message => {
            if (!message.author.bot) {
                let adLength;
                if (message.content.toLowerCase().split('\n')[0].includes('1 week')) adLength = 24 * 60 * 60 * 7 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('1 month')) adLength = 24 * 60 * 60 * 28 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('3 month')) adLength = 24 * 60 * 60 * 28 * 3 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('6 month')) adLength = 24 * 60 * 60 * 28 * 6 * 1000;

                if ((new Date() - message.createdTimestamp) > adLength) {
                    testChan.send({
                        content: `<@${process.env.OWNER_ID}> A premium ad has expired - ${message.url}`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }
        });
    });

    // Check for invite codes that no longer exist - runs once per week (Thursday 00:00)
    const invitesCheck = new cronjob('0 0 * * 4', async function () {
        const invites = await guild.invites.fetch();
        let invitesArr = [];
        invites.forEach(invite => {
            invitesArr.push(invite.code);
        });
        const results = await inviteSchema.find();
        for (const data of results) {
            const { code } = data;
            if (!invitesArr.includes(code)) await dbDeleteOne(inviteSchema, { code: code });
        }
    });

    // Checks for the verification system
    const verificationCheck = new cronjob('*/5 * * * *', async function () {
        const unverifiedRole = guild.roles.cache.get(process.env.UNVERIFIED_ROLE);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const oneDay = 24 * 60 * 60 * 1000;
        unverifiedRole.members.forEach(async member => {
            // Kick users that have been in the server for longer than 3 days without verifying themselves
            if ((new Date() - member.joinedTimestamp) > oneDay && member.pending === true) {
                // Notify the user
                await member.send({ content: `You have been kicked from ForTheContent as you did not verify your account within 24-hours \n\nYou're welcome to join back once you have verified your account discord.gg/forthecontent` })
                    .catch(() => { });
                // Kick the user
                await member.kick().catch(err => console.error(`${path.basename(__filename)} There was a problem kicking a user: `, err));
                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#E04F5F")
                    .setAuthor({ name: `${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${member.user.tag} *(${member.user.id})*
**Reason:** Did not verify account`)
                    .setFooter({ text: `Kick • ${uuidv4()}`, iconURL: process.env.LOG_KICK })
                    .setTimestamp();

                await logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                return;
            }
        });
    });

    rankSort.start();
    warnsCheck.start();
    lastLetterCheck.start();
    countingCheck.start();
    premiumAdsCheck.start();
    invitesCheck.start();
    verificationCheck.start();
}