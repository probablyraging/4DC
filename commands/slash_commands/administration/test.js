const { CommandInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, AttachmentBuilder, ApplicationCommandPermissionsManager, bold, ChannelSelectMenuBuilder, ChannelType, inlineCode } = require("discord.js");
const { sendReply, dbFindOne, dbUpdateOne } = require('../../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const { default: axios } = require('axios');
const path = require("path");
const schema = require('../../../schemas/misc/rank_schema');

module.exports = {
    name: `test`,
    description: `dummy command`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel, user } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        interaction.deleteReply();
    }
}