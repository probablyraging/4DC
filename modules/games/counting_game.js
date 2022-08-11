const { Message } = require('discord.js');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const countingCurrent = require('../../schemas/counting_game/counting_current_schema');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (message?.channel.id === process.env.COUNT_CHAN && !message?.author.bot) {
        let failed = false;

        if (!message?.member?.roles.cache.has(process.env.RANK5_ROLE) && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
            // if the user doesn't have rank 5 or higher, they need to have atleast 1 save to play
            const results = await countingSchema.find({ userId: message.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
            for (const data of results) {
                currentSaves = data.saves;
            }
            // If the user doesn't exist in the database or they have no saves
            if (results === 0 || currentSaves === 0) {
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                return message.reply({
                    content: `${process.env.BOT_DENY} You must be \`rank 5\` OR have at least \`1 save\` to play the counting game. Learn how to get a save by using the \`/counting save\` command`,
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
        } else {
            initGame();
        }

        async function initGame() {
            // if the message isn't a number we can ignore it
            if (isNaN(message.content)) return;

            let results = await countingCurrent.find();

            // If the entry doesn't exist, create it
            if (results < 1) {
                await countingCurrent.create({
                    currentCount: 0,
                    currentRecord: 0,
                    previousCounter: 'null',
                    searchFor: 'currentCount'
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
                results = await countingCurrent.find();
            }

            for (const data of results) {
                currentCount = data.currentCount;
                currentRecord = data.currentRecord;

                // if the same person counted two numbers is a row            
                if (message.author.id === data.previousCounter) {
                    message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                    return message.reply({
                        content: `${process.env.BOT_DENY} You can't count two numbers in a row. You must wait for another player to count first`,
                        allowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                        .then(msg => {
                            setTimeout(() => {
                                msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                            }, 10000);
                        });
                }

                // if the new number didn't increase by 1 from the previous number
                if (!failed && parseInt(message.content) !== currentCount + 1) {
                    failReason = `${message.author} **FAILED** \n> The next number was \`${currentCount + 1}\` but you entered \`${message.content}\``;
                    failed = true
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
                    }
                }

                // check if the user has a personal save to use, if not try and use a guild save
                async function checkForPersonalSaves() {
                    const results = await countingSchema.find({ userId: message.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    for (const data of results) {
                        const { saves } = data;
                        if (saves >= 1) {
                            await usePersonalSave();
                            // if we use a personal save then we need to continue the count, so the next number is what we failed on + 1
                            failMessage = `${failReason} \n> You used \`1 personal save\`, you now have \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount + 2}\` \n> The record to beat is \`${currentRecord}\``;
                            await passedCountWithSave();
                        } else {
                            // if the user doesn't have any saves to use, check to see if there is a guild save to use
                            checkForGuildSaves();
                        }
                    }
                }

                // if we use a user's personal save, we need to subtract it from the database entry
                async function usePersonalSave() {
                    const results = await countingSchema.find({ userId: message.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    for (const data of results) {
                        const { saves } = data;
                        await countingSchema.updateOne({
                            userId: message.author.id
                        }, {
                            saves: saves - 1
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                    }
                }

                // check if the guild has a personal save to use
                async function checkForGuildSaves() {
                    const results = await countingSchema.find({ userId: guild.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    for (const data of results) {
                        const { saves } = data;
                        if (saves >= 1) {
                            await useGuildSave();
                            // if we used a guild save, we need to continue the count, so the next number is what we failed on + 1
                            failMessage = `${failReason} \n> You used \`1 guild save\`, the guild now has \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount + 2}\` \n> The record to beat is \`${currentRecord}\``;
                            await passedCountWithSave();
                        } else {
                            // if there are no guild saves to use, then we fail
                            failMessage = `${failReason} \n> There were no guild saves to use, so the count starts again. To donate a save to the guild, use the \`/counting donatesave\` command \n> The current number is \`${currentCount}\` \n> The record to beat is \`${currentRecord}\``;
                            await failedCount();
                        }
                    }
                }

                // if we use a guild save, we need to subtract it from the database entry
                async function useGuildSave() {
                    const results = await countingSchema.find({ userId: guild.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    for (const data of results) {
                        const { saves } = data;
                        await countingSchema.updateOne({
                            userId: guild.id
                        }, {
                            saves: saves - 1
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                    }
                }

                // every time a user makes a correct count, we add that to their count in the database
                async function updateUsersCount() {
                    const results = await countingSchema.find({ userId: message.author.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    if (results === 0) {
                        // if user doesn't exist in the satabase yet, create an entry for them
                        await countingSchema.creator({
                            userId: message.author.id,
                            username: message.author.username,
                            discriminator: message.author.discriminator,
                            avatar: message.author.avatar,
                            counts: 1,
                            saves: 0
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    } else {
                        for (const data of results) {
                            const { counts, saves } = data;
                            await countingSchema.updateOne({
                                userId: message.author.id
                            }, {
                                username: message.author.username,
                                discriminator: message.author.discriminator,
                                avatar: message.author.avatar,
                                counts: counts + 1,
                                saves: saves
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                        }
                    }
                }

                // keep track of the current count and the previous counter
                async function updateCurrentCount() {
                    await countingCurrent.updateOne({
                        searchFor: 'currentCount'
                    }, {
                        currentCount: currentCount + 1,
                        previousCounter: message.author.id
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }

                // reset the current count if it fails
                async function resetCurrentCount() {
                    await countingCurrent.updateOne({
                        searchFor: 'currentCount'
                    }, {
                        currentCount: 0,
                        previousCounter: 'null'
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }

                // if the current count is higher than the record count, update it
                async function updateRecord() {
                    if (currentCount >= currentRecord) {
                        await countingCurrent.updateOne({
                            searchFor: 'currentCount'
                        }, {
                            currentRecord: currentCount
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
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
            }
        }
    }
}