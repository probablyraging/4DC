const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `unban`,
    description: `Unban a user from the server`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 30,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `user_id`,
        description: `The ID of the user you want to unban`,
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: `reason`,
        description: `The reason for unbanning the user`,
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getString('user_id');
        const reason = options.getString('reason');
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        let error;
        // Make sure a user ID is provided
        if (isNaN(target)) return sendResponse(interaction, `A user ID must contain only numbers`);
        // Fetch the target ban
        const fetchTargetBan = await guild.bans.fetch(target).catch(() => { error = true });
        // Remove the target ban
        await guild.bans.remove(target, { reason: reason }).catch(() => { error = true });
        // If an error occurs, notify the user
        if (error) return sendResponse(interaction, `${target} was not found in the ban list`);
        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#4fe059")
            .setAuthor({ name: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${fetchTargetBan.user.username} *(${fetchTargetBan.user.id})*
        **Reason:** ${reason}`)
            .setFooter({ text: `Unban • ${uuidv4()}`, iconURL: process.env.LOG_UNBAN })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        sendResponse(interaction, `${fetchTargetBan.user.username} was unbanned from the server`);
    }
}