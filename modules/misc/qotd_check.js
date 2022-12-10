const qotdSchema = require('../../schemas/misc/qotd_schema');
const cronjob = require('cron').CronJob;
const path = require('path');

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getRandomQuestion(results, messages) {
    let questionsArr = [];
    for (const data of results) {
        const { messageIds } = data;
        await messages?.forEach(message => {
            if (message.id !== '1051026540068085773' && !messageIds.includes(message.id)) {
                questionsArr.push({ author: message.author, content: message.content, messageId: message.id });
            }
        });
    }
    return questionsArr;
}
module.exports = async (client) => {
    const qotdTimer = new cronjob('0 17 * * *', async function () {
        async function qotdInit() {
            const qotdChannel = client.channels.cache.get(process.env.QOTD_CHAN);
            const questionThread = client.channels.cache.get('1051026540068085773');
            const messages = await questionThread.messages.fetch();
            // Fetch previous question IDs
            const results = await qotdSchema.find();
            // Get all submitted questions and add them to an array
            const questionsArr = await getRandomQuestion(results, messages);
            // Don't continue if no question was found, try again in 1 hour
            if (questionsArr.length === 0) return setTimeout(async () => {
                await qotdInit();
            }, 3600000);
            // Choose a random question
            const question = questionsArr[randomNum(0, questionsArr.length - 1)];
            // Add the new question's message ID to the db array and increase the index
            const messageIds = results[0].messageIds;
            const index = results[0].index;
            messageIds.push(question.messageId);
            await qotdSchema.updateOne({
                guildId: process.env.GUILD_ID
            }, {
                messageIds: messageIds,
                index: index + 1
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            // Create a new thread for for each new question
            const newThread = await qotdChannel.threads.create({
                name: `Question Of The Day ${index}`, // get a numbered index from db
                message: `${question.content}\n\nSubmitted by ${question.author}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a thread: `, err));
            // Lock old threads when picking new question
            const oldThreads = (await qotdChannel.threads.fetch()).threads;
            oldThreads.forEach(thread => {
                if (thread.id !== newThread.id && thread.id !== '1051026540068085773' && thread.locked === false) thread.edit({ archived: true, locked: true });
            });
        }
        qotdInit();
    });
    qotdTimer.start();
}