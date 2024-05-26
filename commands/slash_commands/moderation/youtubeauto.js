// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { dbUpdateOne, dbDeleteOne, sendResponse } from '../../../utils/utils.js';
import ytNotificationSchema from '../../../schemas/yt_notification_schema.js';
import res from 'rss-parser';

export default {
    name: 'youtubeauto',
    description: 'Modify the YouTube Auto list by adding or removing a user',
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'add',
        description: 'Add a user to the YouTube Auto list',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'username',
            description: 'The user who you would like to add',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'channelid',
            description: 'The ID of the user\'s YouTube channel',
            type: ApplicationCommandOptionType.String,
            required: true,
        }],
    },
    {
        name: 'remove',
        description: 'Remove a user from the YouTube Auto list',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'username',
            description: 'The user who you would like to remove',
            type: ApplicationCommandOptionType.User,
            required: true,
        }],
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        switch (options.getSubcommand()) {
            case 'add': {
                const target = options.getMember('username');
                const channelId = options.getString('channelid');

                try {
                    // Store a list of the user's current video IDs
                    const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
                    const items = resolve.items;
                    // Remove the XML markup from video IDs
                    const videoIdArr = [];
                    items.forEach(item => {
                        const regex = item.id.replace('yt:video:', '');
                        videoIdArr.push(regex);
                    });
                    // Add the new user to the database
                    await dbUpdateOne(ytNotificationSchema, { userId: target.id }, { userId: target.id, channelId: channelId, videoIds: videoIdArr });

                    sendResponse(interaction, `${target}, with YouTube channel ID '${channelId}', has been added to the YouTube Auto list`);
                } catch {
                    // If the supplied channel ID is incorrect
                    sendResponse(interaction, 'An error occurred. This is most likely because the channel ID doesn\'t exist');
                }
                break;
            }

            case 'remove': {
                const target = options.getMember('username');
                // Find and remove the user from the database
                await dbDeleteOne(ytNotificationSchema, { userId: target.id });

                sendResponse(interaction, `${target} has been removed from the YouTube Auto list`);
                break;
            }
        }
    },
};