const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const surveySchema = require('../../../schemas/misc/survey_schema');
const path = require('path');

module.exports = {
    name: `survey`,
    description: `A log of survey responses`,
    access: 'owner',
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    usage: `/survey`,
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const results = await surveySchema.find({});

        response.addFields({
            name: `${process.env.BOT_INFO} \`Survey Responses\``, value: `⠀
Reddit - \`${results[0].reddit}\`
Google - \`${results[0].google}\`
YouTUbe - \`${results[0].youtube}\`
Friends or Family - \`${results[0].friend}\`
Other - \`${results[0].other}\``,
            inline: false
        });

        interaction.editReply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
};
