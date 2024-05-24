// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';
import axios from 'axios';

export default {
    name: 'querygpt',
    description: 'Query ChatGPT and receive a helpful response',
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'query',
        description: 'Information to query for',
        type: ApplicationCommandOptionType.String,
        required: true,
    }, {
        name: 'target',
        description: 'User to mention',
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));
        interaction.deleteReply();

        const query = options.getString('query');
        const target = options.getUser('target');

        const requestData = {
            'model': 'gpt-3.5-turbo-1106',
            'messages': [
                { 'role': 'system', 'content': 'Give a short meaningful response' },
                { 'role': 'user', 'content': query }
            ],
            'temperature': 0.7,
            'max_tokens': 512
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OAI_KEY}`
        };

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, { headers });
            const data = response.data;

            if (!data || !data.choices) {
                sendResponse(interaction, 'Unable to generate a response. Try again');
            } else {
                channel.send({
                    content: `### *Information for ${target}:* \n> ${process.env.BOT_DOC} ${data.choices[0].message.content.slice(0, 1900)}`
                }).catch(err => console.error('There was a problem sending a message: ', err));
            }
        } catch (err) {
            console.error('There was a problem: ', err);
        }
    }
};