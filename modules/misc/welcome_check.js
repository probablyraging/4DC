const { newUsers } = require('../../events/guild/guildMemberAdd');
const path = require('path');

module.exports = async (client) => {
    const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);

    setInterval(async () => {
        try {
            if (newUsers.size === 0) return;
            const friendOrFriends = newUsers.size === 1 ? 'a new friend' : 'some new friends';
            const message = await generalChan.send({
                content: `We have ${friendOrFriends}! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to <#1049263519255777301>, or just join the chat :slight_smile:`
            });
            setTimeout(() => {
                message.delete();
            }, 300000);
            newUsers.clear();
        } catch (err) {
            console.error('There was a problem with the welcome_check module: ', err);
        }
    }, 180000);
}
