const { Message, ContextMenuInteraction } = require('discord.js');
const mongo = require('../../mongo');
const countingSchema = require('../../schemas/counting-schema');
const countingCurrent = require('../../schemas/counting-current-schema');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    // TODO : use !d bump as way to gain saves - max of 2 saves per person to encourage more bumps
    //        donate saves to the guild - 1 personal save is 0.25 guild saves
    //        if message doesn't start with a number, return
    //        users with rank 10 must have 1 save before they can play
    //        updare user counts when they are correct
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    let failMessage;
    let failReason;

    if (message.channel.id === process.env.TEST_CHAN && !message.author.bot) {
        const content = parseInt(message?.content);
        const author = message?.author;

        // if the message isn't a number we can ignore it
        if (isNaN(content)) return;

        await mongo().then(async mongoose => {
            const results = await countingSchema.find({ userId: author?.id });
            const results2 = await countingCurrent.find({ searchFor: 'currentCount' });

            // get the current count from the database
            for (const data2 of results2) {
                currentCount = parseInt(data2.currentCount);
            }

            // if the user doesn't have rank 10 (verified), they need to have atleast 1 save to play
            if (results.length === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
                return message?.channel.send({
                    content: `${author} You must have at least **1 save** to play the counting game. Learn how to get a save by typing \`/countingsave\``
                }).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
            }

            for (const data of results) {
                const { saves } = data;

                if (saves === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
                    return message?.channel.send({
                        content: `${author} You must have at least **1 save** to play the counting game. Learn how to get a save by typing \`/countingsave\``
                    }).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
                }
            }

            // fetch the previous batch of messages
            let previousCounter = [];
            await message?.channel.messages.fetch({ limit: 20 }).then(async fetched => {
                const filtered = fetched.filter(m => !m.author.bot);

                filtered.forEach(m => {
                    // only keep the results that are a number
                    if (!isNaN(m.content)) {
                        previousCounter.push({ id: author.id });
                    }
                });

                // if the same person counted two number is a row
                if (previousCounter[1].id === author.id) {
                    failReason = `${author} **FAILED**. You can't count two numbers in a row`
                    await checkForGuildSaves();
                    return;
                } else {
                    await passedCount();
                }

                // if the new number didn't increase by 1 from the previous number
                if (content !== currentCount + 1) {
                    failReason = `${author} **FAILED**. The next number was \`${currentCount + 1}\` but you used \`${content}\``
                    await checkForGuildSaves();
                    return;
                } else {
                    await passedCount();
                }
            });

            // check if the guild has a personal save to use, if not try and use a personal save
            async function checkForGuildSaves() {
                const results = await countingSchema.find({ userId: guild.id });

                for (const data of results) {
                    const { saves } = data;
                    if (saves > 0) {
                        await useGuildSave();
                        failMessage = `${failReason}. You used \`1\` guild save, the guild now has \`${saves - 1}\` saves left. The next number is \`${currentCount}\``
                        await passedCount();
                    } else {
                        checkForPersonalSaves();
                    }
                }
            }

            // check if the user has a personal save to use
            async function checkForPersonalSaves() {
                const results = await countingSchema.find({ userId: author.id });

                for (const data of results) {
                    const { saves } = data;
                    if (saves > 0) {
                        await usePersonalSave();
                        failMessage = `${failReason}. You used \`1\` personal save, you now have \`${saves - 1}\` saves left. The next number is \`${currentCount}\``
                        await passedCount();
                    } else {
                        failMessage = `${failReason}. You did not have any saves, so the count starts again from \`1\`. To get a save, type \`/counting save\``
                        await failedCount();
                    }
                }
            }

            // remove a personal save if one was found
            async function usePersonalSave() {
                const results = await countingSchema.find({ userId: author.id });

                for (const data of results) {
                    const { saves } = data;

                    if (saves === 0) return;

                    await countingSchema.findOneAndUpdate({
                        userId: author.id
                    }, {
                        saves: saves - 1
                    }, {
                        upsert: true
                    })
                }
            }

            // remove a guild save if one was found
            async function useGuildSave() {
                const results = await countingSchema.find({ userId: guild.id });

                for (const data of results) {
                    const { saves } = data;

                    if (saves === 0) return;

                    await countingSchema.findOneAndUpdate({
                        userId: guild.id
                    }, {
                        saves: saves - 1
                    }, {
                        upsert: true
                    })
                }
            }

            // update the user's correct count
            async function updateUsersCount() {
                const results = await countingSchema.find({ userId: author.id });

                for (const data of results) {
                    const { counts } = data;

                    await countingSchema.findOneAndUpdate({
                        userId: author.id
                    }, {
                        counts: counts + 1
                    }, {
                        upsert: true
                    })
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
                })
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
                })
            }

            async function passedCount() {
                if (!message.deleted) {
                    await updateCurrentCount();
                    await updateUsersCount();
                    message.react(process.env.BOT_CONF);
                }
            }

            async function failedCount() {
                if (!message.deleted) {
                    await resetCurrentCount();
                    message.react(process.env.BOT_DENY);
                    message?.channel.send({ content: `${failMessage}` });
                }
            }
        }) // catch mongo
    }
}