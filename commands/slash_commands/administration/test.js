const { CommandInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, AttachmentBuilder, ApplicationCommandPermissionsManager } = require("discord.js");
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require("path");

module.exports = {
    name: `test`,
    description: `dummy command`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel, user } = interaction;

        const results = await tokensSchema.find({ userId: member.id })

        console.log((results[0]?.emojiorsticker - new Date()));

        
    }
}