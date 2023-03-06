const { CommandInteraction, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
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
        const target = await guild.members.fetch(interaction.targetId).catch(() => {});

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // If the target doesn't exist
        if (!target) return sendResponse(interaction, `${process.env.BOT_DENY} This user no longer exists`);

        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setAuthor({ name: `${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`);

        sendResponse(interaction, ``, [response]);
    }
}
