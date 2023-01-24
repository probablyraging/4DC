module.exports = async (interaction) => {
    const { channel, user } = interaction;
    await interaction.deferUpdate();
    // Delete image button
    if (interaction.customId === 'delete-image') {
        const fetchMsg = await channel.messages.fetch(interaction.message.id);
        if (user.id !== fetchMsg?.mentions?.users?.first().id) return;
        fetchMsg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}