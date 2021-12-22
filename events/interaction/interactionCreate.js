const { client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {client} client 
     */
    async execute(interaction, client) {
        if (interaction.isCommand() || interaction.isContextMenu()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            })
                && client.command.module(interaction.commandName);

            command.execute(interaction, client)

            // log command usage
            var today = new Date();
            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);
        }
    }
}