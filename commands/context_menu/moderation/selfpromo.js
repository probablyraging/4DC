const { CommandInteraction, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { sendResponse, dbUpdateOne } = require('../../../utils/utils');
const muteSchema = require('../../../schemas/mute_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `Self-Promo`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, member, channel, targetId } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const fetchMsg = await channel.messages.fetch(targetId);
        const target = await guild.members.fetch(fetchMsg.author);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        // If the target doesn't exist
        if (!target) return sendResponse(interaction, `${process.env.BOT_DENY} This user is no longer in the server`);

        // Delete the target message
        fetchMsg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

        // Update the channel permissions for the target user
        channel.permissionOverwrites.edit(target.id, {
            SendMessages: false,
        }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

        // Add mute to database
        await dbUpdateOne(muteSchema, { userId: target.id, channelId: channel.id }, { userId: target.id, channelId: channel.id, timestamp: 'null' });

        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${member?.user.username}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${target?.user.username} *(${target?.user.id})*
**Channel:** ${channel}
**Duration:** Permanent
**Reason:** Self-promotion`)
            .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: process.env.LOG_MUTE })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        sendResponse(interaction, `${process.env.BOT_CONF} ${target} was muted in ${channel}`);
    }
}
