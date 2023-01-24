const { Message } = require('discord.js');
const { dbCreate, dbUpdateOne } = require('../../utils/utils');
const countingSchema = require('../../schemas/games/counting_schema');
const countingCurrent = require('../../schemas/games/counting_current_schema');
const path = require('path');

/**
 * Sends the current word and if a user's message is edited or deleted in the letter game
 * @param {Message} message The message to be checked
 */
async function checkDeletedCountingMessage(message) {
    if (message?.channel.id === process.env.COUNT_CHAN && !message.author.bot) {
        // Check if message contained a number, and do some other checks to prevent false positives
        const containsNumbers = /^\d+$/.test(message?.content);
        if (!containsNumbers) return;
        // Fetch the current count from the database
        const results = await countingCurrent.find({ searchFor: 'currentCount' });
        for (const data of results) {
            // Ignore if message was deleted by the bot
            if (data.deletedByBot) return;
            // Only do notify if the message was the current count
            if (message?.author.id !== data.previousCounter) return;
            message?.channel.send({
                content: `${process.env.BOT_INFO} ${message.author}'s message was edited or deleted
The current count is \`${data.currentCount}\``
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }
}

/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (message?.channel.id === process.env.COUNT_CHAN && !message?.author.bot) {
        // if the user is newer than a day, they have to wait to play
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if ((new Date() - message?.author.joinedTimestamp) < twentyFourHours) {
            message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
            return message.reply({
                content: `${process.env.BOT_DENY} You're new to the server. We require new members to wait **24 hours** before they can play the counting game`,
                allowedMentions: { repliedUser: true },
                failIfNotExists: false
            }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                    }, 10000);
                });
        } else {
            initGame();
        }

        async function initGame() {
            // if the message isn't a number we can ignore it
            if (isNaN(message.content)) return;

            let results = await countingCurrent.findOne();

            // If the entry doesn't exist, create it
            if (!results) {
                await dbCreate(countingCurrent, { currentCount: 0, currentRecord: 0, previousCounter: 'null', searchFor: 'currentCount' });
                results = await countingCurrent.findOne();
            }

            let currentCount = results.currentCount;
            let currentRecord = results.currentRecord;

            // if the same person counted two numbers is a row            
            if (message?.author.id === results.previousCounter) {
                // Mark this as deleted by bot to not flag message as edited or deleted in messageDelete.js
                await dbUpdateOne(countingCurrent, { searchFor: 'currentCount' }, { deletedByBot: true });
                setTimeout(async () => {
                    // We can revert this shortly after
                    await dbUpdateOne(countingCurrent, { searchFor: 'currentCount' }, { deletedByBot: false });
                }, 2000);
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                return message.reply({
                    content: `${process.env.BOT_DENY} You can't count two numbers in a row. You must wait for another player to count first`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                    .then(msg => {
                        setTimeout(async () => {
                            msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }, 10000);
                    });
            }

            // if the new number didn't increase by 1 from the previous number
            if (parseInt(message.content) !== currentCount - 1) {
                failReason = `${message?.author} **FAILED** \n> The next number was \`${currentCount - 1}\` but you entered \`${message.content}\``;
                await checkForPersonalSaves();
                return;
            } else {
                passedCount();
            }

            // regular pass
            async function passedCount() {
                if (!message.deleted) {
                    await updateCurrentCount();
                    await updateRecord();
                    await updateUsersCount();
                    message.react(process.env.BOT_CONF).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));
                    isIncrementOf100();
                }
            }

            // check if the user has a personal save to use, if not try and use a guild save
            async function checkForPersonalSaves() {
                const results = await countingSchema.findOne({ userId: message?.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                // if the user doesn't have any saves to use, check to see if there is a guild save to use
                if (!results) {
                    // if the user doesn't have any saves to use, check to see if there is a guild save to use
                    return checkForGuildSaves();
                }
                const { saves } = results;
                if (saves >= 1) {
                    await usePersonalSave();
                    // if we use a personal save then we need to continue the count, so the next number is what we failed on + 1
                    failMessage = `${failReason} \n> You used \`1 personal save\`, you now have \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount - 2}\` \n> The record to beat is \`${currentRecord}\``;
                    await passedCountWithSave();
                } else {
                    // if the user doesn't have any saves to use, check to see if there is a guild save to use
                    checkForGuildSaves();
                }
            }

            // if we use a user's personal save, we need to subtract it from the database entry
            async function usePersonalSave() {
                const results = await countingSchema.findOne({ userId: message?.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const { saves } = results;
                await dbUpdateOne(countingSchema, { userId: message?.author.id }, { saves: saves - 1 });
            }

            // check if the guild has a personal save to use
            async function checkForGuildSaves() {
                const results = await countingSchema.findOne({ userId: guild.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const { saves } = results;
                if (saves >= 1) {
                    await useGuildSave();
                    // if we used a guild save, we need to continue the count, so the next number is what we failed on + 1
                    failMessage = `${failReason} \n> You used \`1 guild save\`, the guild now has \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount - 2}\` \n> The record to beat is \`${currentRecord}\``;
                    await passedCountWithSave();
                } else {
                    // if there are no guild saves to use, then we fail
                    failMessage = `${failReason} \n> There were no guild saves to use, so the count starts again. To donate a save to the guild, use the \`/counting donatesave\` command \n> The current number is \`10000\` \n> The record to beat is \`${currentRecord}\``;
                    await failedCount();
                }
            }

            // if we use a guild save, we need to subtract it from the database entry
            async function useGuildSave() {
                const results = await countingSchema.findOne({ userId: guild.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const { saves } = results;
                await dbUpdateOne(countingSchema, { userId: guild.id }, { saves: saves - 1 });
            }

            // every time a user makes a correct count, we add that to their count in the database
            async function updateUsersCount() {
                const results = await countingSchema.findOne({ userId: message?.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                if (!results) {
                    // if user doesn't exist in the satabase yet, create an entry for them
                    await dbCreate(countingSchema, {
                        userId: message?.author.id,
                        username: message?.author.username,
                        discriminator: message?.author.discriminator,
                        avatar: message?.author.avatar,
                        counts: 1,
                        saves: 0
                    });
                } else {
                    const { counts, saves } = results;
                    await dbUpdateOne(countingSchema, { userId: message?.author.id }, {
                        username: message?.author.username,
                        discriminator: message?.author.discriminator,
                        avatar: message?.author.avatar,
                        counts: counts + 1,
                        saves: saves
                    });
                }
            }

            // keep track of the current count and the previous counter
            async function updateCurrentCount() {
                await dbUpdateOne(countingCurrent, { searchFor: 'currentCount' }, { currentCount: currentCount - 1, previousCounter: message?.author.id });
            }

            // reset the current count if it fails
            async function resetCurrentCount() {
                await dbUpdateOne(countingCurrent, { searchFor: 'currentCount' }, { currentCount: 10000, previousCounter: 'null' });
            }

            // if the current count is higher than the record count, update it
            async function updateRecord() {
                if (currentCount >= currentRecord) {
                    await dbUpdateOne(countingCurrent, { searchFor: 'currentCount' }, { currentRecord: currentCount - 1 });
                }
            }

            // if the count was passed, but we needed to use a save first
            async function passedCountWithSave() {
                if (!message.deleted) {
                    await updateCurrentCount();
                    await updateRecord();
                    message.react(process.env.BOT_DENY)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));
                    message?.channel.send({ content: `${failMessage}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }

            // if the count was failed
            async function failedCount() {
                if (!message.deleted) {
                    await resetCurrentCount();
                    message.react(process.env.BOT_DENY);
                    message?.channel.send({ content: `${failMessage}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }

            // If number is an increment of 100, add a free guild save
            async function isIncrementOf100() {
                if (parseInt(message.content) % 100 === 0) {
                    const guildResults = await countingSchema.findOne({ userId: guild.id })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    if ((guildResults.saves + 1) > 3) {
                        await dbUpdateOne(countingSchema, { userId: guild.id }, { saves: 3 });
                        message.react('1061798848890142800')
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));
                    } else {
                        await dbUpdateOne(countingSchema, { userId: guild.id }, { saves: guildResults.saves + 1 });
                        message.react('1061798848890142800')
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));
                    }
                }
            }
        }
    }
}

module.exports.checkDeletedCountingMessage = checkDeletedCountingMessage;