// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Filter and bulk delete messages based on a target user or all non-system messages
 * @param {Object} interaction The interaction object
 * @param {TextChannel} channel - The channel to fetch messages from and delete them
 * @param {Collection<Snowflake, Message>} messages - The messages to filter and delete
 * @param {Object} targetUser The user object to filter the messages by
 * @param {number} amount The maximum number of messages to delete
 */
async function bulkDeleteFilteredMessages(interaction, channel, messages, targetUser, amount) {
    const filteredMessages = messages.filter(message => {
        const isTargetUser = targetUser ? message.author.id === targetUser.id : true;
        const isNotSystemMessage = !message.system;
        return isTargetUser && isNotSystemMessage && amount > filteredMessages.length;
    });

    try {
        const bulkDelete = await channel.bulkDelete(filteredMessages, true);
        const response = targetUser
            ? `${bulkDelete.size} messages from ${targetUser} deleted in ${channel}`
            : `${bulkDelete.size} messages deleted in ${channel}`;
        sendResponse(interaction, response);
        return bulkDelete.size;
    } catch (err) {
        console.error('There was a problem deleting a message: ', err);
    }
}

export default {
    name: 'delete',
    description: 'Delete a specific number of messages from a channel or user',
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 10,
    dm_permission: false,
    options: [{
        name: 'amount',
        description: 'Number of messages to delete',
        type: ApplicationCommandOptionType.Number,
        required: true,
    },
    {
        name: 'username',
        description: 'Delete a specific user\'s messages',
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, member, channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const logChan = guild.channels.cache.get(process.env.MSGLOG_CHAN);
        const amountToDelete = options.getNumber('amount');
        const targetUser = options.getMember('username');
        const fetchedMessages = await channel.messages.fetch().catch(err => console.error('There was a problem fetching channel messages: ', err));

        if (!guild.members.me.permissionsIn(channel).has('ManageMessages') || !guild.members.me.permissionsIn(channel).has('SendMessages') || !guild.members.me.permissionsIn(channel).has('ViewChannel')) { return sendResponse(interaction, `Missing permissions for ${channel}`); }

        if (fetchedMessages.size < 1) { return sendResponse(interaction, `${process.env.BOT_INFO} I could not find any messages from ${targetUser} in ${channel}`); }

        if (amountToDelete < 1 && member.id === process.env.OWNER_ID || amountToDelete > 100 && member.id === process.env.OWNER_ID) { return sendResponse(interaction, `${process.env.BOT_INFO} Amount must be between 1 and 100`); }

        if (amountToDelete < 1 || amountToDelete > 5 && member.id !== process.env.OWNER_ID) { return sendResponse(interaction, `${process.env.BOT_INFO} Amount must be between 1 and 5`); }

        if (!targetUser && member.id !== process.env.OWNER_ID) { return sendResponse(interaction, `${process.env.BOT_INFO} You must include a username`); }

        const deletedSize = await bulkDeleteFilteredMessages(interaction, channel, fetchedMessages, targetUser, amountToDelete);

        // Log to channel
        const log = new EmbedBuilder()
            .setAuthor({ name: `${member?.user.username}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setColor('#E04F5F')
            .addFields({ name: 'Channel', value: `${channel}`, inline: true },
                { name: 'Reason', value: `Bulk deleted ${deletedSize} messages`, inline: true })
            .setFooter({ text: `Bulk Delete • ${uuidv4()}`, iconURL: process.env.LOG_DELETE })
            .setTimestamp();

        logChan.send({
            embeds: [log],
        }).catch(err => console.error('There was a problem sending an embed: ', err));
    },
};