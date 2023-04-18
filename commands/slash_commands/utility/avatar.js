const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `avatar`,
    description: `Fetch a user's avatar and display it in an embed`,
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `username`,
        description: `The user whos avatar you want to fetch`,
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getMember(`username`) || member;

        // Create an embed with the target user's avatar
        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setAuthor({ name: `${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`)

        sendResponse(interaction, ``, [response]);
    }
}