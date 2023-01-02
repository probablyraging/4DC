const { newUsers } = require('../../events/guild/guildMemberAdd');
const path = require('path');

module.exports = async (client) => {
    const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);
    let timeout;

    const resetTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            if (newUsers.size === 0) return;
            const friendOrFriends = newUsers.size === 1 ? 'a new friend' : 'some new friends';
            const message = await generalChan.send({
                content: `We have ${friendOrFriends}! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to <#1049263519255777301>, or just join the chat :slight_smile:`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            deleteMessage(message);
            newUsers.clear();
        }, 180000);
    }

    const deleteMessage = message => {
        setTimeout(() => {
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }, 300000);
    }

    resetTimeout();
}
