const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

module.exports = async (interaction) => {
    const { client, guild, channel, user, member } = interaction;

    await interaction.deferUpdate();

    // Report image button
    if (interaction.customId === 'report-image') {
        const fetchMsg = await channel.messages.fetch(interaction.message.id);
        const reportId = uuidv4();
        const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);

        let reportEmbed = new EmbedBuilder()
            .setColor('#E04F5F')
            .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
            .setDescription(`[View Message](${fetchMsg?.url})`)
            .addFields({ name: `Message Author`, value: `${fetchMsg?.mentions?.users?.first()}`, inline: false })
            .setFooter({ text: `ID ${user?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-close')
                    .setLabel('Close Report')
                    .setStyle(ButtonStyle.Danger)
            );

        await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}> <@&${process.env.MOD_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch((err) => console.error(`Could not send report '${reportId}' to staff channel: `, err));
    }

    // Delete image button
    if (interaction.customId === 'delete-image') {
        const fetchMsg = await channel.messages.fetch(interaction.message.id);
        if (user.id !== fetchMsg?.mentions?.users?.first().id) return;
        fetchMsg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}