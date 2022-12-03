const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const { addAttachment } = require("../../../modules/misc/report_attachment");

module.exports = {
    name: "report",
    description: "Report a user to the ForTheContent staff",
    cooldown: 60,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "proof",
        description: "Provide a screenshot of the incident you are reporting",
        type: ApplicationCommandOptionType.Attachment,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const attachment = options.getAttachment('proof');

        if (!attachment.contentType.includes('image')) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} Attachment type must be an image file (png, jpg, etc..)`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        addAttachment(1, attachment.url);

        const modal = new ModalBuilder()
            .setTitle('Report Form')
            .setCustomId('report-modal')

        const input1 = new TextInputBuilder()
            .setCustomId('input1')
            .setLabel('Username')
            .setStyle(1)
            .setPlaceholder(`Offender's username and tag (e.g: ProbablyRaging#7080`)
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input2 = new TextInputBuilder()
            .setCustomId('input2')
            .setLabel('Reason')
            .setStyle(2)
            .setPlaceholder('Please include a brief description..')
            .setMinLength(1)
            .setMaxLength(1024)
            .setRequired(true)

        const row1 = new ActionRowBuilder().addComponents([input1]);
        const row2 = new ActionRowBuilder().addComponents([input2]);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    }
};
