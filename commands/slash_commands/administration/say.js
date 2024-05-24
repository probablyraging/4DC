// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';

export default {
    name: 'say',
    description: 'Send a channel message as the bot',
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'message',
        description: 'The message you want to send',
        type: ApplicationCommandOptionType.String,
        required: false,
    },
    {
        name: 'channel',
        description: 'The channel to send the message to. Leave black for current channel',
        type: ApplicationCommandOptionType.Channel,
        required: false,
    },
    {
        name: 'image',
        description: 'If you want to send an image as well',
        type: ApplicationCommandOptionType.String,
        required: false,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const toChannel = options.getChannel('channel');
        const message = options.getString('message');
        const image = options.getString('image');

        const sendToChannel = toChannel ? toChannel : channel;

        sendToChannel.send({
            content: message ? message : '',
            files: image ? [image] : []
        }).catch(err => console.error('There was a problem sending a message: ', err));

        sendResponse(interaction, 'Message sent');
    }
};