// eslint-disable-next-line no-unused-vars
import { EmbedBuilder, CommandInteraction, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle, codeBlock } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'Report Message',
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { client, member, guild, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const reportId = uuidv4();
        const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);

        let reportEmbed = new EmbedBuilder()
            .setColor('#E04F5F')
            .setAuthor({ name: `${member?.user.username}`, iconURL: member?.displayAvatarURL({ dynamic: true }) })
            .setDescription(`[View Message](${fetchMsg?.url})`)
            .addFields({ name: 'Reported User', value: `${target}`, inline: false },
                { name: 'Reported Content', value: codeBlock(fetchMsg?.content), inline: false })
            .setFooter({ text: `ID ${member?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary),
            );

        const reportMessage = await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed] }).catch((err) => console.error(`Could not send report '${reportId}' to staff channel: `, err));

        reportEmbed = new EmbedBuilder(reportEmbed)
            .setFooter({ text: `ID ${member?.id}-${reportMessage.id}`, iconURL: guild.iconURL({ dynamic: true }) });

        reportMessage.edit({ embeds: [reportEmbed], components: [button] }).catch(err => console.error('There was a problem editing a message ', err));

        sendResponse(interaction, 'Thank you for helping to keep the server safe! Your report has been submitted and staff will review it shortly');
    },
};
