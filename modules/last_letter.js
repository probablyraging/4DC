const { Message, MessageEmbed } = require('discord.js');
const mongo = require('../mongo');
const letterSchema = require('../schemas/letter-schema');
const letterRecordSchema = require('../schemas/letter-record-schema');
const letterLBSchema = require('../schemas/letter-lb-schema');
const fetch = require('node-fetch');
const path = require('path');
let currentCounter = 0;
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const llChan = guild.channels.cache.get(process.env.LL_CHAN);

    if (message.channel.id === process.env.LL_CHAN && !message.author.bot) {
        /**
         * IGNORE MESSAGES THAT START WITH A '>'
         */
        if (message.content.startsWith('>')) return;

        /**
         * GET CURRENT COUNT FROM DATABASE
         */
        const searchFor = 'currentCount';
        await mongo().then(async (mongoose) => {
            try {
                const results = await letterSchema.find({ searchFor: 'currentCount' });

                for (const info of results) {
                    var { currentLetterCounter } = info;

                    currentCounter = parseInt(currentLetterCounter);
                    dbCurrentCounter = parseInt(currentCounter);
                }
            } finally {
                // do nothing
            }
        });

        let fetchFirst = message.channel.messages.cache.first();

        await message.channel.messages.fetch({ limit: 15 }).then(async fetched => {
            failed = false;
            deleted = false;

            msgContentArr = [];

            const filtered = fetched.filter(m => !m.author.bot);

            filtered.forEach(msg => {
                msgContentArr.push(msg.content.toLowerCase());
            });

            lastLetter = msgContentArr[1].slice(-1);
            firstLetter = msgContentArr[0].charAt(0);

            /**
             * IF MESSAGE CONTAINS MORE THAN ONE WORD
             */
            if (!failed && message.content.split(' ').length > 1) {
                deleted = true;
                message.delete()

                return message.reply({
                    content: `${process.env.BOT_DENY} \`To send chat messages, put a '> ' (greater than followed by a space) in front of your message\``,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete()
                    }, 6000);
                })
            }

            /**
             * IF NEW MESSAGE HAS SYMBOL OR NUMBER
             */
            var hasSymbol = /^[a-zA-Z]+$/;
            const test = !hasSymbol.test(message.content);

            if (!failed && test) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                message.delete().then(() => {
                    nextLetter = fetchFirst.content;

                    return message.reply({
                        content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. You can only use \`a-Z\`. Your previous message was deleted. The next letter is \`${nextLetter.toUpperCase()}\`!`,
                        deleteallowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    });
                });
            }

            /**
             * IF LAST LETTER AND FIRST LETTER DON'T MATCH
             */
            if (!failed && lastLetter !== firstLetter) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. Your letter was \`${lastLetter.toUpperCase()}\` but you used \`${message.content.charAt(0).toUpperCase()}\`. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);;
                });
            }

            /**
             * IF MESSAGE LESS THAN 2 CHARACTERS
             */
            if (!failed && message.content.length < 2) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. Your word has to be longer than \`1\` letter. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            /**
             * IF WORD HAS BEEN USED TO SOON
             */
            if (!failed) {
                await message.channel.messages.fetch({ limit: 10 }).then(fetched => {
                    const repeats = fetched.filter(m => !m.author.bot && !m.content.startsWith('>') && m.content.toLowerCase() === message.content.toLowerCase()).size;

                    if (repeats > 1) {
                        failed = true;
                        currentCounter = 0;
                        dbUpdateCount();

                        return message.reply({
                            content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. The word \`${message.content.toUpperCase()}\` was used in the last 10 messages. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        });
                    }
                });
            }

            /**
             * IF SAME USER ADDS TWO MESSAGES IN A ROW
             */
            if (!failed) {
                await message.channel.messages.fetch({ limit: 3 }).then(async fetched => {
                    const repeats = fetched.filter(m => m.author.id && !m.content.startsWith('>') === message.author.id).size;

                    if (repeats > 1) {
                        failed = true;
                        currentCounter = 0;
                        dbUpdateCount();

                        return message.reply({
                            content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. You can't add two words in a row. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        });
                    }

                    if (repeats < 2) {
                        await message.channel.messages.fetch({ limit: 3 }).then(fetched => {
                            const repeats = fetched.filter(m => !m.author.bot && !m.content.startsWith('>') && m.author.id === message.author.id).size

                            if (repeats > 1) {
                                failed = true;
                                currentCounter = 0;
                                dbUpdateCount();

                                return message.reply({
                                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. You can't add two words in a row. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                                    deleteallowedMentions: { repliedUser: true },
                                    failIfNotExists: false
                                }).catch(err => {
                                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                                });
                            }
                        });
                    }
                });
            }

            /**
             * CHECK IF WORD IS IN DICTIONARY
             */
            if (!failed) {
                const resolve = await fetch(`https://en.wiktionary.org/wiki/${message.content.toLowerCase()}`);

                if (resolve.status !== 200) {
                    failed = true;
                    currentCounter = 0;
                    dbUpdateCount();

                    return message.reply({
                        content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentCounter}**. The word \`${message.content.toUpperCase()}\` isn't in the dictionary. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                        deleteallowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    });
                }
            }

            /**
             * CHECK FOR CURRENT LEVEL AND UPDATE CHANNEL DESCRIPTION
             */
            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 20) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 20 && message.content.length < 4) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLetterCounter}**. Your word didn't have enough characters. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 40) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 40 && message.content.length < 5) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLetterCounter}**. Your word didn't have enough characters. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 80) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 80 && message.content.length < 6) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLetterCounter}**. Your word didn't have enough characters. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 100) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 100 && message.content.length < 7) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLetterCounter}**. Your word didn't have enough characters. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 150) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 150 && message.content.length < 8) {
                failed = true;
                currentCounter = 0;
                dbUpdateCount();

                return message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLetterCounter}**. Your word didn't have enough characters. The next letter is \`${message.content.charAt(0).toUpperCase()}\`!`,
                    deleteallowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });
            }

            /**
             * UPDATE letterRecord IF currentCounter IS HIGHER
             */
            const searchForRecord = 'currentRecord';

            if (!failed) {
                async function dbCheckRecord() {
                    await mongo().then(async mongoose => {
                        try {
                            const results = await letterRecordSchema.find({ searchForRecord });

                            for (const info of results) {
                                const { letterRecord } = info;

                                dbletterRecord = parseInt(letterRecord);

                                if (dbCurrentCounter > dbletterRecord) {
                                    await letterRecordSchema.findOneAndRemove({ searchForRecord });

                                    await letterRecordSchema.findOneAndUpdate({
                                        letterRecord: currentCounter,
                                        searchForRecord,
                                    },
                                        {
                                            letterRecord: currentCounter,
                                            searchForRecord,
                                        },
                                        {
                                            upsert: true
                                        });
                                }
                            }
                        } finally {
                            // do nothing
                        }
                    });
                }
                dbCheckRecord();

                /**
                 * UPDATE USER'S CORRECT COUNT OR CREATE
                 * COLLECTION IF USER DOESN'T EXIST IN DATABASE
                 */
                let userId = message.author.id;

                await mongo().then(async mongoose => {
                    try {
                        const results = await letterLBSchema.find({ userId });

                        if (results.length === 0) {
                            const correctCount = 1;

                            await letterLBSchema.findOneAndUpdate({
                                userId,
                                correctCount,
                                searchFor
                            },
                                {
                                    userId,
                                    correctCount,
                                    searchFor
                                },
                                {
                                    upsert: true
                                });
                        } else if (results.length > 0) {
                            const results = await letterLBSchema.find({ userId });

                            for (const info of results) {
                                const { correctCount } = info;

                                usersCount = correctCount;

                                await letterLBSchema.findOneAndRemove({ userId });

                                await letterLBSchema.findOneAndUpdate({
                                    userId,
                                    correctCount: usersCount++,
                                    searchFor
                                }, {
                                    userId,
                                    correctCount: usersCount++,
                                    searchFor
                                }, {
                                    upsert: true
                                });
                            }
                        }
                    } finally {
                        // do nothing
                    }
                });
            }

            /**
             * UPDATE CURRENT CURRENT COUNTER OR RESET IF FAIL
             */
            async function dbUpdateCount() {
                await mongo().then(async mongoose => {
                    try {
                        await letterSchema.findOneAndRemove({ searchFor: 'currentCount' })

                        await letterSchema.findOneAndUpdate({
                            currentLetterCounter: currentCounter,
                            searchFor,
                        },
                            {
                                currentLetterCounter: currentCounter,
                                searchFor,
                            },
                            {
                                upsert: true
                            });
                    } finally {
                        // do nothing
                    }
                });
            }
            dbUpdateCount();
        });
        if (!deleted && !failed) message.react(process.env.BOT_CONF);

        if (!deleted && failed) {
            message.react(process.env.BOT_DENY);
            message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 0`);
        };
    }
}