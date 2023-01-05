const { Message, EmbedBuilder } = require('discord.js');
const { dbCreate, dbUpdateOne } = require('../../utils/utils');
const timerSchema = require('../../schemas/misc/timer_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const tokensSchema = require('../../schemas/misc/tokens_schema');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message?.channel.id === process.env.BUMP_CHAN && message?.author.id === '302050872383242240') {
        // delete the warning about regular commands
        if (message?.content.toLowerCase().includes('regular commands are being replaced')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }

        // replace disboard reply with our own embed and do counting save stuff
        const bumpUser = message?.interaction?.user.id;
        let savesMessage;
        let tokenMessage;

        if (message.embeds.length >= 1) {
            message?.channel.messages.fetch(message?.id).then(async fetched => {
                let embed = fetched?.embeds[0];

                if (embed.description.toLowerCase().includes('bump done!')) {
                    message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

                    // Add two hours to the current time
                    const myDate = new Date();
                    const timestamp = myDate.setHours(myDate.getHours() + 2);

                    message?.channel.permissionOverwrites.edit(message?.guild.id, {
                        SendMessages: false,
                    })

                    await dbUpdateOne(timerSchema, { timer: 'bump' }, { timestamp });

                    // add a counting save to the user
                    const results = await countingSchema.find({ userId: bumpUser });
                    // if user doesn't have an entry yet
                    if (results.length === 0) {
                        await dbCreate(countingSchema, { userId: bumpUser, saves: 0, counts: 0 });

                        const results = await countingSchema.find({ userId: bumpUser });

                        for (const data of results) {
                            const { saves } = data;

                            if (saves < 2) {
                                await dbUpdateOne(countingSchema, { userId: bumpUser }, { saves: saves + 1 });
                                savesMessage = `You earned a save for the counting game and now have \`${saves + 1}/2\` saves`
                            } else {
                                savesMessage = `You already have the \`2/2\` saves for the counting game`
                            }
                        }
                    } else {
                        for (const data of results) {
                            const { saves } = data;

                            if (saves < 2) {
                                await dbUpdateOne(countingSchema, { userId: bumpUser }, { saves: saves + 1 });
                                savesMessage = `You earned a save for the counting game and now have \`${saves + 1}/2\` saves`
                            } else {
                                savesMessage = `You already have the \`2/2\` saves for the counting game`
                            }
                        }
                    }

                    // Add tokens to the user
                    const tokenLog = client.channels.cache.get(process.env.CREDITLOG_CHAN);
                    const results2 = await tokensSchema.find({ userId: bumpUser });

                    // Check to see if the user is in our database yet, if not, add them
                    if (!results2.length === 0) {
                        await dbCreate(tokensSchema, { userId: bumpUser, tokens: 5 });
                        // Log when a user's tokens increase or decrease
                        tokenLog.send({
                            content: `${process.env.TOKENS_UP} <@${bumpUser}> gained **5** tokens for bumping the server, they now have **5** tokens`,
                            allowedMentions: {
                                parse: []
                            }
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                    // Update the user's tokens
                    for (const data of results2) {
                        let { tokens, dailyTokens } = data;
                        // Hard cap of earning 75 tokens per day
                        if (isNaN(dailyTokens)) dailyTokens = 0;
                        if ((75 - dailyTokens) < 5) {
                            // Calculate the tokens to be added
                            const tokensToAdd = (75 - dailyTokens) < 0 ? 0 : 75 - dailyTokens;
                            // Update the database entry
                            await dbUpdateOne(tokensSchema, { userId: bumpUser }, { tokens: tokens + tokensToAdd, dailyTokens: dailyTokens + tokensToAdd });
                            // Log when a user's tokens increase or decrease
                            tokenLog.send({
                                content: `${process.env.TOKENS_UP} <@${bumpUser}> gained **${tokensToAdd}** tokens for bumping the server, they now have **${tokens + tokensToAdd}** tokens`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                            tokenMessage = (75 - dailyTokens) !== 0 ? `You earned \`${75 - dailyTokens}\` tokens for the tokens store` : `You've already earned the max tokens for today`;
                        } else {
                            // Update the database entry
                            await dbUpdateOne(tokensSchema, { userId: bumpUser }, { tokens: tokens + 5, dailyTokens: dailyTokens + 5 });
                            // Log when a user's tokens increase or decrease
                            tokenLog.send({
                                content: `${process.env.TOKENS_UP} <@${bumpUser}> gained **5** tokens for bumping the server, they now have **${tokens + 5}** tokens`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                            tokenMessage = `You earned \`5\` tokens for the tokens store`;
                        }
                    }

                    const bumpConfirm = new EmbedBuilder()
                        .setColor('#32B9FF')
                        .setTitle(`${message?.interaction?.user.username}`)
                        .setURL('https://disboard.org/review/create/820889004055855144')
                        .setDescription(`Consider leaving an honest review of the server [**HERE**](https://disboard.org/review/create/820889004055855144)

${tokenMessage}
${savesMessage}`)
                        .setImage('https://i.imgur.com/xDAlBKp.png')

                    // Fetch and delete the previous bump ping message
                    await message?.channel.messages.fetch({ limit: 3 }).then(fetched => {
                        fetched.forEach(message => {
                            if (message?.content.toLowerCase().includes('the server can be bumped again')) {
                                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                            }
                        })
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));

                    // Send the confirmed bump embed
                    message?.channel.send({
                        embeds: [bumpConfirm]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                }
            });
        }
    }

    // reminder to use the new slash commands
    if (message?.channel.id === process.env.BUMP_CHAN && message?.content.toLowerCase().includes('!d bump')) {
        message?.reply({
            content: `${process.env.BOT_DENY} That is an old command. Please use /bump now instead`,
            allowedMentions: { repliedUser: true },
            failIfNotExists: false
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        setTimeout(() => {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }, 600);
    }

    // delete all regular message that aren't from bots
    if (message?.channel.id === process.env.BUMP_CHAN && !message?.author.bot) {
        message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
    }
}