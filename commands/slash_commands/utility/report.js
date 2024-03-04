import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, codeBlock } from "discord.js";
import { sendResponse } from '../../../utils/utils.js';

export default {
    name: "report",
    description: "Report a user to the server staff",
    cooldown: 15,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "offender",
        description: "The user you are reporting",
        type: ApplicationCommandOptionType.Mentionable,
        required: true
    },
    {
        name: "reason",
        description: "The reason for your report",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "screenshot",
        description: "Provide a screenshot of the incident you are reporting",
        type: ApplicationCommandOptionType.Attachment,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`There was a problem deferring an interaction: `, err));

        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
        const target = options.getUser('offender');
        const reason = options.getString('reason');
        const attachment = options.getAttachment('screenshot');

        // If target is not a valid user
        if (!target?.username) return sendResponse(interaction, `Please specify a valid user to report`);

        // If attachment content type isn't an image
        if (attachment && (attachment.contentType === null || !attachment.contentType.includes('image')))
            return sendResponse(interaction, `Attachment type must be an image file (.png, .jpg, etc..)`);

        let reportEmbed = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${member?.user.username}`, iconURL: member?.displayAvatarURL({ dynamic: true }) })
            .addFields({ name: `Reported User`, value: `${target}`, inline: false },
                { name: `Reason`, value: codeBlock(reason), inline: false })
            .setTimestamp();

        // Get the attachment if one exists and add it to the embed
        if (attachment) reportEmbed.setImage(attachment.url);

        // Create a button for closing the report and taking action
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary)
            );

        // Send the report embed to the staff channel
        const reportMessage = await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed] })
            .catch(err => console.error(`Could not send report to staff channel: `, err));

        // Edit the embed to include the reporter's ID as well as the report message's ID
        reportEmbed = new EmbedBuilder(reportEmbed)
            .setFooter({
                text: `ID ${member?.id}-${reportMessage.id}`,
                iconURL: guild.iconURL({ dynamic: true })
            })

        reportMessage.edit({ embeds: [reportEmbed], components: [button] }).catch(err => console.error(`There was a problem editing a message `, err));

        sendResponse(interaction, `Thank you for helping to keep the server safe! Your report has been submitted and staff will review it shortly`);
    }
};
