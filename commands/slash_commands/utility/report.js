const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const { v4: uuidv4 } = require("uuid");

module.exports = {
    name: "report",
    description: "Report a user to the ForTheContent staff",
    cooldown: 15,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "offender",
        description: "The user you are reporting",
        type: ApplicationCommandOptionType.User,
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

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
        const target = options.getUser('offender');
        const reason = options.getString('reason');
        const attachment = options.getAttachment('screenshot');
        const reportId = uuidv4();

        // If attachment content type isn't an image
        if (attachment && (attachment.contentType === null || !attachment.contentType.includes('image')))
            return sendResponse(interaction, `${process.env.BOT_DENY} Attachment type must be an image file (.png, .jpg, etc..)`);

        let reportEmbed = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.displayAvatarURL({ dynamic: true }) })
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

        const reportMessage = await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed], components: [button] })
            .catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));

        reportEmbed = new EmbedBuilder(reportEmbed)
            .setFooter({ text: `ID ${member?.id}-${reportMessage.id}`, iconURL: guild.iconURL({ dynamic: true }) })
        reportMessage.edit({ embeds: [reportEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message `, err));

        sendResponse(interaction, `${process.env.BOT_CONF} Thank you for helping to keep ForTheContent safe! Your report has been submitted and staff will review it shortly`);
    }
};
