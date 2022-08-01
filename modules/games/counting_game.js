const { Message } = require('discord.js');
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
        let currentSaves = 0;

        // if the message isn't a number we can ignore it
        if (isNaN(content)) return;

        const results = await countingSchema.find({ userId: author?.id })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
        const results2 = await countingCurrent.find({ searchFor: 'currentCount' })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        // if the user doesn't have rank 5 or verified role, check if they have any saves
        for (const data of results) {
            currentSaves = data.saves;
        }
        // get the current count from the database
        for (const data2 of results2) {
            currentCount = data2.currentCount;
            currentRecord = data2.currentRecord;
        }

        // if the user doesn't have rank 5 or higher, they need to have atleast 1 save to play
        if (results.length === 0 && !message?.member?.roles.cache.has(process.env.RANK5_ROLE) && currentSaves === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
            message?.channel.send({
                content: `${author} You must be \`rank 5\` OR have at least \`1 save\` to play the counting game. Learn how to get a save by using the \`/counting save\` command`
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

            if (saves === 0 && !message?.member?.roles.cache.has(process.env.RANK5_ROLE) && saves === 0 && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE)) {
                message?.channel.send({
                    content: `${author} You must be \`rank 5\` OR have at least \`1 save\` to play the counting game. Learn how to get a save by using the \`/counting save\` command`
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
        // if the same person counted two numbers is a row
        const results3 = await countingCurrent.find({ searchFor: 'currentCount' });
        for (const data of results3) {
            if (author.id === data.previousCounter) {
                failReason = `${author} **FAILED** \n> You can't count two numbers in a row`;

                failed = true;

                await checkForPersonalSaves();
                return;
            }
        }

        // if the new number didn't increase by 1 from the previous number
        if (!failed && parseInt(content) !== currentCount + 1) {
            failReason = `${author} **FAILED** \n> The next number was \`${currentCount + 1}\` but you entered \`${content}\``;

            failed = true

            await checkForPersonalSaves();
            return;
        }

        if (!failed) {
            await passedCount();
        }

        // check if the user has a personal save to use, if not try and use a guild save
        async function checkForPersonalSaves() {
            const results = await countingSchema.find({ userId: author.id })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

            for (const data of results) {
                const { saves } = data;

                if (saves >= 1) {
                    await usePersonalSave();
                    // if we use a personal save then we need to continue the count, so the next number is what we failed on + 1
                    failMessage = `${failReason} \n> You used \`1 personal save\`, you now have \`${saves - 1} save(s)\` left \n> The current number is \`${currentCount + 1}\` \n> The record to beat is ${currentRecord}`

                    await passedCountWithSave();
                } else {
                    // if the user doesn't have any saves to use, check to see if there is a guild save to use
                    checkForGuildSaves();
                }
            }
        }

        // check if the guild has a personal save to use
        async function checkForGuildSaves() {
            const results = await countingSchema.find({ userId: guild.id })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

            for (const data of results) {
                const { saves } = data;

                if (saves >= 1) {
                    await useGuildSave();
                    // if we used a guild save, we need to continue the count, so the next number is what we failed on + 1
                    failMessage = `${failReason} \n> You used \`1 guild save\`, the guild now has \`${saves - 1} save(s)\` left \n> The current number is \`${currentCount + 1}\` \n> The record to beat is ${currentRecord}`

                    await passedCountWithSave();
                } else {
                    // if there are no guild saves to use, then we fail
                    failMessage = `${failReason} \n> There were no guild saves to use, so the count starts again. To donate a save to the guild, use the \`/counting donatesave\` command \n> The current number is \`${currentCount}\` \n> The record to beat is ${currentRecord}`

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

                await countingSchema.updateOne({
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

                await countingSchema.updateOne({
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
                await countingSchema.updateOne({
                    userId: author.id,
                }, {
                    userId: author.id,
                    username: author.username,
                    discriminator: author.discriminator,
                    avatar: author.avatar,
                    counts: 1,
                    saves: 0
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
            } else {
                for (const data of results) {
                    const { counts, saves } = data;

                    await countingSchema.updateOne({
                        userId: author.id
                    }, {
                        username: author.username,
                        discriminator: author.discriminator,
                        avatar: author.avatar,
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
                previousCounter: author.id
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
                previousCounter: ''
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