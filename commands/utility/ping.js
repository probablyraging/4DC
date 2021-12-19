const { CommandInteraction } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'pong',
    permission: 'ADMINISTRATOR',
    execute(interaction) {
        interaction.reply({ content: `pong` })
    }
}