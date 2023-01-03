const { Message } = require('discord.js');
const { dbCreate, dbUpdateOne } = require('../../modules/misc/database_update_handler');
const tokensSchema = require('../../schemas/misc/tokens_schema');
const tokensLimit = new Set();
const increment = new Map();
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const tokenLog = guild.channels.cache.get(process.env.CREDITLOG_CHAN);
    // Tokens earning is disabled in these channels
    const disabletokens = [process.env.CONTENT_SHARE, process.env.BOT_CHAN, process.env.COUNT_CHAN, process.env.LL_CHAN];
    if (!message?.author.bot && !tokensLimit.has(message?.author.id)) {
        // If the message is in a tokens disabled channel, don't add tokens
        if (disabletokens.includes(message?.channel.id)) return;
        // Fetch the user's db entry
        const results = await tokensSchema.find({ userId: message?.author.id });
        // Check to see if the user is in our database yet, if not, add them
        if (results.length === 0) {
            await dbCreate(tokensSchema, { userId: message?.author.id, tokens: 1, dailyTokens: 1 });
        }
        // Update the user's tokens
        for (const data of results) {
            let { tokens, dailyTokens } = data;
            // Hard cap of earning 75 tokens per day
            if (isNaN(dailyTokens)) dailyTokens = 0;
            if ((dailyTokens + 1) > 75) return;
            await dbUpdateOne(tokensSchema, { userId: message?.author.id }, { tokens: tokens + 1, dailyTokens: dailyTokens + 1 });

            // If it's the user's first time earning 5 tokens, let them know how to spend them
            if (!results[0]?.initialNotification && (tokens + 1) === 5) {
                tokenLog.send({
                    content: `${process.env.TOKENS_UP} ${message?.author} you just earnt your first **5** tokens! Head over to the <#1049791650060324954> to spend them`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                // Add a db entry so we don't notify them again
                await dbUpdateOne(tokensSchema, { userId: message?.author.id }, { initialNotification: true });
            }

            // Only log in increments of 5 - account for token cap
            if (increment.has(message?.member.id)) {
                if (increment.get(message?.member.id) === 4) {
                    if ((75 - dailyTokens) >= 5) {
                        // Log when a user's tokens increase or decrease
                        tokenLog.send({
                            content: `${process.env.TOKENS_UP} ${message?.author} gained **5** tokens while chatting in the server, they now have **${tokens + 5}** tokens`,
                            allowedMentions: {
                                parse: []
                            }
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    } else {
                        // Don't log if no tokans were gained
                        if (75 - dailyTokens <= 0) return;
                        // Log when a user's tokens increase or decrease
                        tokenLog.send({
                            content: `${process.env.TOKENS_UP} ${message?.author} gained **${75 - dailyTokens}** tokens while chatting in the server, they now have **${tokens + (75 - dailyTokens)}** tokens`,
                            allowedMentions: {
                                parse: []
                            }
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                    increment.delete(message?.member.id);
                } else {
                    increment.set(message?.member.id, increment.get(message?.member.id) + 1);
                }
            } else {
                increment.set(message?.member.id, 1);
            }
        }
        // Add user to tokensLimit for 60 seconds to prevent spamming for tokens
        tokensLimit.add(message?.author.id);
        setTimeout(() => {
            tokensLimit.delete(message?.author.id);
        }, 60000);
    }
}