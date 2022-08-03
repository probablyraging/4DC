const { Message } = require('discord.js');
const letterSchema = require('../../schemas/letter_game/letter_schema');
const letterRecordSchema = require('../../schemas/letter_game/letter_record_schema');
const letterLBSchema = require('../../schemas/letter_game/letter_lb_schema');
const letterVals = require('../../lists/letter-values');
const fetch = require('node-fetch');
const path = require('path');
let currentCounter = 0;
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (message.channel.id === process.env.LL_CHAN && !message.author.bot) {
        /**
         * IGNORE MESSAGES THAT START WITH A '>'
         */
        if (message.content.startsWith('>')) return;

        /**
         * GET CURRENT COUNT FROM DATABASE
         */
        const searchFor = 'currentCount';
        const results = await letterSchema.find({ searchFor: 'currentCount' });

        for (const info of results) {
            var { currentLetterCounter } = info;

            currentCounter = parseInt(currentLetterCounter);
            dbCount = parseInt(currentLetterCounter)
        }

        let fetchFirst = message.channel.messages.cache.first();

        await message.channel.messages.fetch({ limit: 15 }).then(async fetched => {
            failed = false;
            deleted = false;

            msgContentArr = [];

            const filtered = fetched.filter(m => !m.author.bot && !m.content.startsWith('>'));

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
                    content: `${process.env.BOT_DENY} To send chat messages, put a '> ' (greater than followed by a space) in front of your message`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete()
                    }, 6000);
                });
            }

            /**
             * IF NEW MESSAGE HAS SYMBOL OR NUMBER
             */
            var hasSymbol = /^[a-zA-Z]+$/;
            const test = !hasSymbol.test(message.content);

            if (!failed && test) {
                failed = true;
                deleted = true;

                message.delete().then(() => {
                    nextLetter = fetchFirst.content;

                    message.reply({
                        content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. You can only use \`a-Z\`. Your previous message was deleted. The next letter is \`${nextLetter.slice(-1).toUpperCase()}\`!`,
                        allowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    });

                    currentCounter = 0;
                    return dbUpdateCount();
                });
            }

            /**
             * IF LAST LETTER AND FIRST LETTER DON'T MATCH
             */
            if (!failed && lastLetter !== firstLetter) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your letter was \`${lastLetter.toUpperCase()}\` but you used \`${message.content.charAt(0).toUpperCase()}\`. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);;
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            /**
             * IF MESSAGE LESS THAN 2 CHARACTERS
             */
            if (!failed && message.content.length < 2) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word has to be longer than \`1\` letter. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            /**
             * IF WORD HAS BEEN USED TO SOON
             */
            if (!failed) {
                await message.channel.messages.fetch({ limit: 10 }).then(fetched => {
                    const repeats = fetched.filter(m => !m.author.bot && !m.content.startsWith('>') && m.content.toLowerCase() === message.content.toLowerCase()).size;

                    if (repeats > 1) {
                        failed = true;

                        message.reply({
                            content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. The word \`${message.content.toUpperCase()}\` was used in the last 10 messages. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        });

                        currentCounter = 0;
                        return dbUpdateCount();
                    }
                });
            }

            /**
             * IF SAME USER ADDS TWO MESSAGES IN A ROW
             */
            if (!failed) {
                await message.channel.messages.fetch({ limit: 2 }).then(async fetched => {
                    const repeats = fetched.filter(m => !m.content.startsWith('>') && m.author.id === message.author.id).size;

                    if (repeats > 1) {
                        failed = true;

                        message.reply({
                            content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. You can't add two words in a row. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                            allowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => {
                            console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                        });

                        currentCounter = 0;
                        return dbUpdateCount();
                    }

                    if (repeats < 2) {
                        await message.channel.messages.fetch({ limit: 3 }).then(fetched => {
                            const repeats = fetched.filter(m => !m.author.bot && !m.content.startsWith('>') && m.author.id === message.author.id).size

                            if (repeats > 2) {
                                failed = true;

                                message.reply({
                                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. You can't add two words in a row. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                                    allowedMentions: { repliedUser: true },
                                    failIfNotExists: false
                                }).catch(err => {
                                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                                });

                                currentCounter = 0;
                                return dbUpdateCount();
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
                const body = await resolve.text();
                const checkOne = await body.toString().includes('toctext">English');
                const checkTwo = await body.toString().includes('class="mw-headline" id="English"');

                function capitalizeFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                // Check for capatilized entries
                const resolve2 = await fetch(`https://en.wiktionary.org/wiki/${capitalizeFirstLetter(message.content.toLowerCase())}`);
                const body2 = await resolve2.text();
                const checkThreee = await body2.toString().includes('toctext">English');
                const checkFour = await body2.toString().includes('class="mw-headline" id="English"');

                if (!checkOne && !checkTwo && !checkThreee && !checkFour) {
                    failed = true;

                    message.reply({
                        content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. The word \`${message.content.toUpperCase()}\` isn't in the English dictionary - <https://en.wiktionary.org/wiki/${message.content.toLowerCase()}>
The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                        allowedMentions: { repliedUser: true },
                        failIfNotExists: false
                    }).catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                    });

                    currentCounter = 0;
                    return dbUpdateCount();
                }
            }

            /**
             * CHECK FOR CURRENT LEVEL AND UPDATE CHANNEL DESCRIPTION
             */
            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 19) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`4\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 20 - 4 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 20 && message.content.length < 4) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word didn't have enough characters. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 39) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`5\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 40 - 5 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 40 && message.content.length < 5) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word didn't have enough characters. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 79) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`6\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 80 - 6 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 80 && message.content.length < 6) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word didn't have enough characters. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 99) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`7\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 100 - 7 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 100 && message.content.length < 7) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word didn't have enough characters. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            // NEW LEVEL
            if (!failed && parseInt(currentCounter) === 149) {
                message.channel.send(`**NEW LEVEL** All words must now be more than \`8\` characters long!`)
                message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 150 - 8 CHARACTER MINIMUM`)
            }
            if (!failed && parseInt(currentCounter) >= 150 && message.content.length < 8) {
                failed = true;

                message.reply({
                    content: `${process.env.BOT_DENY} ${message.author} **FAILED at ${dbCount}**. Your word didn't have enough characters. The next letter is \`${message.content.slice(-1).toUpperCase()}\`!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                });

                currentCounter = 0;
                return dbUpdateCount();
            }

            /**
             * UPDATE letterRecord IF currentCounter IS HIGHER
             */
            const searchForRecord = 'currentRecord';

            if (!failed) {
                async function dbCheckRecord() {
                    const results = await letterRecordSchema.find({ searchForRecord });

                    for (const info of results) {
                        const { letterRecord } = info;

                        dbletterRecord = parseInt(letterRecord);

                        if (dbCount > dbletterRecord) {
                            await letterRecordSchema.findOneAndRemove({ searchForRecord });

                            await letterRecordSchema.updateOne({
                                letterRecord: currentCounter,
                                searchForRecord,
                            }, {
                                letterRecord: currentCounter,
                                searchForRecord,
                            }, {
                                upsert: true
                            });
                        }
                    }
                }
                dbCheckRecord();

                /**
                 * UPDATE USER'S CORRECT COUNT OR CREATE
                 * COLLECTION IF USER DOESN'T EXIST IN DATABASE
                 */
                let userId = message.author.id;
                const results = await letterLBSchema.find({ userId });

                if (results.length === 0) {
                    const correctCount = 1;

                    await letterLBSchema.updateOne({
                        userId,
                        username: message.author.username,
                        discriminator: message.author.discriminator,
                        avatar: message.author.avatar,
                        correctCount,
                        searchFor
                    }, {
                        userId,
                        username: message.author.username,
                        discriminator: message.author.discriminator,
                        avatar: message.author.avatar,
                        correctCount,
                        searchFor
                    }, {
                        upsert: true
                    });
                } else if (results.length > 0) {
                    const results = await letterLBSchema.find({ userId });

                    for (const info of results) {
                        const { correctCount } = info;

                        let newCount = parseInt(correctCount);

                        // find the value of each letter in a submission
                        let tens = 0;
                        let eights = 0;
                        let fives = 0;
                        let fours = 0;
                        let threes = 0;
                        let twos = 0;
                        let ones = 0;

                        for (let i = 0; i < message?.content?.length; i++) {
                            const letters = message?.content?.toLowerCase().split('');

                            letters.forEach(letter => {
                                if (letterVals.tens.letters.includes(letter[i])) {
                                    tens++;
                                }
                                if (letterVals.eights.letters.includes(letter[i])) {
                                    eights++;
                                }
                                if (letterVals.fives.letters.includes(letter[i])) {
                                    fives++;
                                }
                                if (letterVals.fours.letters.includes(letter[i])) {
                                    fours++;
                                }
                                if (letterVals.threes.letters.includes(letter[i])) {
                                    threes++;
                                }
                                if (letterVals.twos.letters.includes(letter[i])) {
                                    twos++;
                                }
                                if (letterVals.ones.letters.includes(letter[i])) {
                                    ones++;
                                }
                            })
                        }

                        const tensMath = tens * letterVals.tens.value;
                        const eightsMath = eights * letterVals.eights.value;
                        const fivesMath = fives * letterVals.fives.value;
                        const foursMath = fours * letterVals.fours.value;
                        const threesMath = threes * letterVals.threes.value;
                        const twosMath = twos * letterVals.twos.value;
                        const onesMath = ones * letterVals.ones.value;
                        const totalPoints = tensMath + eightsMath + fivesMath + foursMath + threesMath + twosMath + onesMath + newCount;

                        await letterLBSchema.findOneAndRemove({ userId });

                        await letterLBSchema.updateOne({
                            userId,
                            correctCount: totalPoints,
                            username: message.author.username,
                            discriminator: message.author.discriminator,
                            avatar: message.author.avatar,
                            searchFor
                        }, {
                            userId,
                            correctCount: totalPoints,
                            username: message.author.username,
                            discriminator: message.author.discriminator,
                            avatar: message.author.avatar,
                            searchFor
                        }, {
                            upsert: true
                        });
                    }
                }
            }

            /**
             * UPDATE CURRENT CURRENT COUNTER OR RESET IF FAIL
             */
            async function dbUpdateCount() {
                await letterSchema.findOneAndRemove({ searchFor: 'currentCount' })

                await letterSchema.updateOne({
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
            }
            dbUpdateCount();
        });
        if (!deleted && !failed) currentCounter++, message.react(process.env.BOT_CONF);

        if (!deleted && failed) {
            message.react(process.env.BOT_DENY);
            message.channel.setTopic(`MATCH THE FIRST LETTER OF YOUR WORD TO THE LAST LETTER OF THE PREVIOUS WORD | CURRENT LEVEL: 0`);
        };
    }
}