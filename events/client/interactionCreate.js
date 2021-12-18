module.exports = {
    name: 'interactionCreate',
    once: true,
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.log(err)
    
            await interaction.reply({
                content: `Error`,
                ephemeral: true
            })
        }
    }
}