const { client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {client} client 
     */
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({ 
                content: `${process.env.BOT_INFO} Could not run this command`, 
                ephemeral: true
            })
                && client.command.module(interaction.commandName);

            command.execute(interaction, client)
        }
    }
}