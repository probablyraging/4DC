const { CommandInteraction, ApplicationCommandType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `Channel Unmute`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const permissionInChannel = channel.permissionsFor(target.id)?.has(PermissionFlagsBits.SendMessages);

        // If permissionInChannel is undefined it is likely because the user is no longer in the server
        if (permissionInChannel === undefined) return sendResponse(interaction, `${process.env.BOT_DENY} An error occured. This user may no longer be a server memeber`);
        // If the target is already muted in this channel
        if (permissionInChannel === true) return sendResponse(interaction, `${process.env.BOT_DENY} ${target} is already muted in ${channel}`);

        // Update the channel permissions for the target user
        channel.permissionOverwrites.edit(target.id, {
            SendMessages: null,
        }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#4fe059")
            .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${target?.tag} *(${target?.id})*
**Channel:** ${channel}`)
            .setFooter({ text: `Channel Unmute • ${uuidv4()}`, iconURL: process.env.LOG_UNMUTE })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        sendResponse(interaction, `${process.env.BOT_CONF} ${target} was unmuted in ${channel}`);
    }
}