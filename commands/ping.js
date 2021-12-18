const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message as the bot')
        .addStringOption((option) =>
            option
                .setName('message')
                .setDescription('Message to send')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.reply({
            content: `${interaction.options.getString('message')}`,
            ephemeral: false
        });
    }
}