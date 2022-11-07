const { ContextMenuInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
const fetch = require('node-fetch');
const { Buffer } = require('node:buffer');

module.exports = {
    name: `test`,
    description: `dummy command`,
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel, user } = interaction;
    }
}