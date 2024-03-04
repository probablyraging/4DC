import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';

/**
 * Send a messages to a channel using a webhook. Messages can contain attachments
 * @param {TextChannel} channel The channel to send the message to
 * @param {Message} message The message to send
 * @param {MessageAttachment} attachments An array of attachments to include in the message
 */
async function sendMessageWithWebhook(channel, message, attachments) {
    const authorUsername = message.member ? message.member.displayName : message.author.username;
    const webhookContent = {
        content: message.content,
        allowedMentions: { parse: ['users'] }
    };
    if (attachments.length > 0) webhookContent.files = attachments;
    channel.createWebhook({ name: authorUsername, avatar: message.author.displayAvatarURL({ format: 'png', size: 256 }) }).then(webhook => {
        webhook.send(webhookContent).catch(err => console.error(`There was a problem sending a webhook: `, err)).then(() => {
            webhook.delete().catch(err => console.error(`There was a problem deleting a webhook: `, err));
        });
    });
}

export default {
    name: `move`,
    description: `Move a message to a specific channel. Move up to 5 messages at a time`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 10,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: `channel`,
            description: `The channel you want to move a message to`,
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: `message`,
            description: `The ID of the message you want to move`,
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: `message2`,
            description: `The ID of the message you want to move`,
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: `message3`,
            description: `The ID of the message you want to move`,
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: `message4`,
            description: `The ID of the message you want to move`,
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: `message5`,
            description: `The ID of the message you want to move`,
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`There was a problem deferring an interaction: `, err));

        const destinationChannel = options.getChannel('channel');
        // Get the message IDs of all options
        const messageIds = [
            options.getString('message'),
            options.getString('message2'),
            options.getString('message3'),
            options.getString('message4'),
            options.getString('message5')
        ].filter(Boolean);

        // Make sure the bot has the correct permissions in both channels
        const channels = [channel, destinationChannel];
        if (!channels.every(c => guild.members.me.permissionsIn(c).has('ManageMessages') && guild.members.me.permissionsIn(c).has('SendMessages') && guild.members.me.permissionsIn(c).has('ViewChannel')))
            return sendResponse(interaction, `I do not have the necessary permissions in one or more of the specified channel`);
        // Fetch all messages from the target channel
        const fetchedMessages = await channel.messages.fetch();
        // Make sure the destination channel is a text channel
        if (destinationChannel.type !== 0) return sendResponse(interaction, `You can't move a message to a ${destinationChannel.type === 2 ? 'voice channel' : 'category'}`);
        // Filter the messages to only include the ones that the user specified and filter if they return null
        const messagesToMove = messageIds.map(id => fetchedMessages.get(id)).filter(Boolean);
        // If there are no messages to move
        if (messagesToMove.length === 0) return sendResponse(interaction, `${process.env.BOT_ERROR} There are no messages to move`);
        // Create a webhook and send each message to the destination channel
        for (const [i, message] of messagesToMove.entries()) {
            const attachments = message.attachments.map(attachment => attachment.url);
            await sendMessageWithWebhook(destinationChannel, message, attachments);
            message.delete().catch(err => console.error(`There was a problem deleting a message: `, err));
        }
        // Send a confirmation message in the original channel
        sendResponse(interaction, `${messagesToMove.length} messages moved to ${destinationChannel}`);
    }
};
