const { v4: uuidv4 } = require('uuid');

module.exports = async (interaction) => {
    const { client, guild, channel, user, member } = interaction;
    await interaction.deferUpdate();
    // Delete image button
    if (interaction.customId === 'delete-image') {
        const fetchMsg = await channel.messages.fetch(interaction.message.id);
        if (user.id !== fetchMsg?.mentions?.users?.first().id) return;
        fetchMsg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}