const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `suggestion`,
    description: `Approve a suggestions`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 10,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `id`,
        description: `The message ID of the suggestions`,
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, options } = interaction;
        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const id = options.getString('id');
        const suggestionChannel = guild.channels.cache.get(process.env.SUGGESTIONS_CHAN);
        const message = await suggestionChannel.messages.fetch(id);
        const embed = message?.embeds[0];

        // If the message doesn't contain an embed
        if (!embed) return sendResponse(interaction, `${process.env.BOT_DENY} This message does not contain a suggestion`);

        await message.react(`${process.env.BOT_CONF}`).catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

        interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
    }
}