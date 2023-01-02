const { CommandInteraction, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `Avatar`,
    cooldown: 5,
    type: ApplicationCommandType.User,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction;
        const target = await guild.members.fetch(interaction.targetId);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // If target doesn't exist
        if (!target) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This user no longer exists`,
                ephemeral: true,
            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setAuthor({ name: `${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`);

        interaction.editReply({
            embeds: [response],
            ephemeral: true,
        }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    },
};
