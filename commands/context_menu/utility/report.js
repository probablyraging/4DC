const { EmbedBuilder, CommandInteraction, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `Report Message`,
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { client, user, member, guild, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const reportId = uuidv4();
        const staffChannel = client.channels.cache.get(process.env.TEST_CHAN);

        let reportEmbed = new EmbedBuilder()
            .setColor('#E04F5F')
            .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
            .setDescription(`[View Message](${fetchMsg?.url})`)
            .addFields({ name: `Reported User`, value: `${target}`, inline: false },
                { name: `Reported Content`, value: `\`\`\`${fetchMsg?.content}\`\`\``, inline: false })
            .setFooter({ text: `ID ${user?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary)
            );

        const reportMessage = await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch((err) => console.error(`Could not send report '${reportId}' to staff channel: `, err));

        reportEmbed = new EmbedBuilder(reportEmbed)
            .setFooter({ text: `ID ${member?.id}-${reportMessage.id}`, iconURL: guild.iconURL({ dynamic: true }) })
        reportMessage.edit({ embeds: [reportEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message `, err));

        sendResponse(interaction, `${process.env.BOT_CONF} Thank you for helping to keep ForTheContent safe! Your report has been submitted and staff will review it shortly`);
    },
};
