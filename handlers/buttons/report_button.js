const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
    const { client, guild, user } = interaction;

    await interaction.deferUpdate();

    const channel = client.channels.cache.get(interaction.channelId);
    const reportMessage = await channel.messages.fetch(interaction.message.id);
    const reportEmbed = reportMessage.embeds[0].data;
    const reporterId = reportEmbed.footer.text.split('ID ')[1];
    const reporterUser = await guild.members.fetch(reporterId);

    const closedEmbed = new EmbedBuilder(reportEmbed)
        .setColor("#32BEA6")
        .addFields({ name: `Closed By`, value: `${user}`, inline: false })

    reportMessage.edit({ embeds: [closedEmbed], components: [] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message `, err));

    const replyEmbed = new EmbedBuilder(reportEmbed)
        .setColor("#32BEA6")
        .setTitle(`ForTheContent Report`)
        .setDescription(`Your report's status has been updated to \`CLOSED\``)

    reporterUser.send({ embeds: [replyEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message `, err));
}