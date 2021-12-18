const fs = require('fs');

module.exports = (client, Discord, commands) => {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }
}