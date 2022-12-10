const { Message } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message?.author.bot) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const promoChan = guild.channels.cache.get(process.env.CONTENT_SHARE);

    if (message?.channel.id === process.env.CONTENT_SHARE) {
        let found = false;
        await promoChan.messages.fetch({ limit: 5 }).then(messages => {
            messages.forEach(async message => {
                if (message.author.id === client.user.id && message.content.includes('friendly reminder')) {
                    found = true;
                    if (found) {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        promoChan.send({
                            content: `:warning: Link embed previews can be purchased in <#1049791650060324954>. You earn XP toward your rank by chatting and being active in the server. Posts sent in <#856719763187302441> don't earn XP :warning:
:warning: Hey there, just a friendly reminder that a more effective way of growing your audience is by chatting with other creators in <#820889004055855147>. Feel free to come introduce yourself and meet the other members on the server :warning:`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));

        if (!found) {
            promoChan.send({
                content: `:warning: Link embed previews can be purchased in <#1049791650060324954>. You earn XP toward your rank by chatting and being active in the server. Posts sent in <#856719763187302441> don't earn XP :warning:
:warning: Hey there, just a friendly reminder that a more effective way of growing your audience is by chatting with other creators in <#820889004055855147>. Feel free to come introduce yourself and meet the other members on the server :warning:`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }
}