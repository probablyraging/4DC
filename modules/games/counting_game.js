const { Message } = require('discord.js');
const mongo = require('../../mongo');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const countingCurrent = require('../../schemas/counting_game/counting_current_schema');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    let failMessage;
    let failReason;

    if (message?.channel.id === process.env.COUNT_CHAN && !message?.author.bot) {
        const content = message?.content;
        const author = message?.author;

        // if the message isn't a number we can ignore it
        if (isNaN(content)) return;

        await mongo().then(async mongoose => {
            const results = await countingSchema.find({ userId: author?.id })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
            const results2 = await countingCurrent.find({ searchFor: 'currentCount' })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

            // get the current count from the database
            for (const data2 of results2) {
                currentCount = data2.currentCount;
                currentRecord = data2.currentRecord;
            }

            // if the user doesn't have rank 10 (verified), they need to have atleast 1 save to play
            if (results.length === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
                message?.channel.send({
                    content: `${author} You must have at least \`1 save\` to play the counting game. Learn how to get a save by using the \`/counting save\` command`
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }, 10000);
                });

                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                return;
            }

            for (const data of results) {
                const { saves } = data;

                if (saves === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
                    message?.channel.send({
                        content: `${author} You must have at least \`1 save\` to play the counting game. Learn how to get a save by using the \`/counting save\` command`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                        .then(msg => {
                            setTimeout(() => {
                                msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                            }, 10000);
                        });

                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    return;
                }
            }

            let failed = false;
            let previousCounter = [];
            // fetch the previous batch of messages
            await message?.channel.messages.fetch({ limit: 20 }).then(async fetched => {
                const filtered = fetched.filter(m => !m.author.bot);

                filtered.forEach(m => {
                    // only keep the results that are a number
                    if (!isNaN(m.content)) {
                        previousCounter.push({ id: m.author.id });
                    }
                });

                // if the same person counted two number is a row
                if (previousCounter[1].id === author.id) {
                    failReason = `${author} **FAILED** \n> You can't count two numbers in a row`;

                    failed = true;

                    await checkForGuildSaves();
                    return;
                }

                // if the new number didn't increase by 1 from the previous number
                if (!failed && parseInt(content) !== currentCount + 1) {
                    failReason = `${author} **FAILED** \n> The next number was \`${currentCount + 1}\` but you entered \`${content}\``;

                    failed = true

                    await checkForGuildSaves();
                    return;
                }
            });

            if (!failed) {
                await passedCount();
            }

            // check if the guild has a personal save to use, if not try and use a personal save
            async function checkForGuildSaves() {
                const results = await countingSchema.find({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                for (const data of results) {
                    const { saves } = data;

                    if (saves >= 1) {
                        await useGuildSave();
                        // if we used a guild save, we need to continue the count, so the next number is what we failed on + 1
                        failMessage = `${failReason} \n> You used \`1 guild save\`, the guild now has \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount + 1}\``

                        await passedCountWithSave();
                    } else {
                        // if the guild doesn't have any saves to use, check to see if the user has a personal save to use
                        checkForPersonalSaves();
                    }
                }
            }

            // check if the user has a personal save to use
            async function checkForPersonalSaves() {
                const results = await countingSchema.find({ userId: author.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                for (const data of results) {
                    const { saves } = data;

                    if (saves >= 1) {
                        await usePersonalSave();
                        // if we use a personal save then we need to continue the count, so the next number is what we failed on + 1
                        failMessage = `${failReason} \n> You used \`1 personal save\`, you now have \`${saves - 1} save(s)\` left \n> The next number is \`${currentCount + 1}\``

                        await passedCountWithSave();
                    } else {
                        // if the user doesn't have a personal save to use, then we fail
                        failMessage = `${failReason} \n> You did not have any saves, so the count starts again. To get a save, use the \`/counting save\` command \n> The next number is \`1\``

                        await failedCount();
                    }
                }
            }

            // if we use a guild save, we need to subtract it from the database entry
            async function useGuildSave() {
                const results = await countingSchema.find({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                for (const data of results) {
                    const { saves } = data;

                    await countingSchema.findOneAndUpdate({
                        userId: guild.id
                    }, {
                        saves: saves - 1
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            }

            // if we use a user's personal save, we need to subtract it from the database entry
            async function usePersonalSave() {
                const results = await countingSchema.find({ userId: author.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                for (const data of results) {
                    const { saves } = data;

                    await countingSchema.findOneAndUpdate({
                        userId: author.id
                    }, {
                        saves: saves - 1
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            }

            // every time a user makes a correct count, we add that to their count in the database
            async function updateUsersCount() {
                const results = await countingSchema.find({ userId: author.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                if (results === 0) {
                    // if user doesn't exist in the satabase yet, create an entry for them
                    await countingSchema.findOneAndUpdate({
                        userId: author.id,
                    }, {
                        userId: author.id,
                        counts: 1,
                        saves: 0
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                } else {
                    for (const data of results) {
                        const { counts, saves } = data;

                        await countingSchema.findOneAndUpdate({
                            userId: author.id
                        }, {
                            counts: counts + 1,
                            saves: saves
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                    }
                }


            }

            // keep track of the current count
            async function updateCurrentCount() {
                await countingCurrent.findOneAndUpdate({
                    searchFor: 'currentCount'
                }, {
                    currentCount: currentCount + 1,
                    searchFor: 'currentCount'
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }

            // reset the current count if it fails
            async function resetCurrentCount() {
                await countingCurrent.findOneAndUpdate({
                    searchFor: 'currentCount'
                }, {
                    currentCount: 0,
                    searchFor: 'currentCount'
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }

            // if the current count is higher than the record count, update it
            async function updateRecord() {
                if (currentCount >= currentRecord) {
                    await countingCurrent.findOneAndUpdate({
                        searchFor: 'currentCount'
                    }, {
                        currentRecord: currentCount + 1
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            }

            // regular pass
            async function passedCount() {
                if (!message.deleted) {
                    await updateCurrentCount();
                    await updateRecord();
                    await updateUsersCount();
                    message.react(process.env.BOT_CONF)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));
                }
            }

            // if the count was passed, but we needed to use a save first
            async function passedCountWithSave() {
                if (!message.deleted) {
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
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    }
}