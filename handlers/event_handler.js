const fs = require('fs');

module.exports = (client, Discord, commands) => {
    const load_dir = (dirs) => {
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${dirs}/${file}`);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, commands));
            } else {
                client.on(event.name, (...args) => event.execute(...args, commands));
            }
        }
    }
    ['client'].forEach(e => load_dir(e));
}