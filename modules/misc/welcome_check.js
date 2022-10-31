const { newUsers } = require('../../events/guild/guildMemberAdd');
const path = require('path');

module.exports = async (client) => {
    const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);    
    // Periodically check our set size and send a welcome message in the general channel if needed
    setInterval(async () => {
        if (newUsers.size > 0) {
            if (newUsers.size === 0) return;
            if (newUsers.size === 1) {
                generalChan.send({
                    content: `We have a new friend! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourself, shout yourself out *(no links)*, or just join the chat :slight_smile:`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err)).then(message => {
                    setTimeout(() => {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook message: `, err));
                    }, 300000);
                });
            } else if (newUsers.size > 1) {
                generalChan.send({
                    content: `We have some new friends! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourselves, shout yourselves out *(no links)*, or just join the chat :slight_smile:`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err)).then(message => {
                    setTimeout(() => {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook message: `, err));
                    }, 300000);
                });
            }
            // Clear the set
            newUsers.clear();
        }
    }, 180000);
}