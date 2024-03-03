export default async (interaction) => {
    const { member, channel, message } = interaction;

    await interaction.deferReply({ ephemeral: true });

    try {
        if (channel.ownerId === member.id || member.roles.cache.has(process.env.STAFF_ROLE)) {
            interaction.deleteReply();
            const newTags = [...channel.appliedTags, '1033879593775538196'].slice(-5);
            const channelName = channel.name.slice(0, 90);
            await message.delete();
            await channel.setAppliedTags(newTags);
            await channel.setName(`[SOLVED] ${channelName}`);
            await channel.setLocked(true);
            await channel.setArchived(true);
        } else {
            interaction.followUp({ content: `Only the original poster or staff can mark a post as resolved!` });
        }
    } catch (err) {
        console.log('There was a problem marking a thread as solved: ', err);
    }
}