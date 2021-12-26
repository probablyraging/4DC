const { Message } = require('discord.js');
const cooldown = new Set();
const path = require('path');
/**
 * 
 * @param {Message} message 
 */

module.exports = (message, client, Discord) => {
    const author = message?.author;
    const content = message?.content.toLocaleLowerCase();
    const conditions = ['https://', 'http://', 'www.'];
    const check = conditions.some(el => content.includes(el));

    if (!author) {
        return;
    } else {
        if (check && !message?.member?.permissions.has("MANAGE_MESSAGES") && !message?.author.bot) {
            if (cooldown.has(message?.author.id)) {
                const response = `${process.env.BOT_DENY} \`You're sending links too fast. Please wait 30 seconds\``;
                let messageId = message?.id;

                author?.send({
                    content: `${response}`,
                }).catch(() => {
                    message?.reply({
                        content: `${response}`,
                        deleteallowedMentions: { repliedUser: true }
                    }).catch(() => {
                        message?.reply({
                            content: `${response}`,
                            deleteallowedMentions: { repliedUser: true },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                            .then(msg => setTimeout(() => {
                                msg?.delete().catch(err => console.error(`${path.basename(__filename)} 1 There was a problem deleting a message: `, err));
                            }, 4000));
                    }).then(msg => setTimeout(() => {
                        msg?.delete().catch(err => console.error(`${path.basename(__filename)} 2 There was a problem deleting a message: `, err));
                    }, 4000));
                }).then(() => {
                    setTimeout(() => {
                        message?.delete().catch(err => console.error(`${path.basename(__filename)} 3 ### THIS IS EXPECTED SOME TIMES: `, err));
                    }, 600);
                });
            } else {
                cooldown.add(message?.author.id)

                setTimeout(() => {
                    cooldown.delete(message?.author.id)
                }, 30000);
            }
        }
    }
}