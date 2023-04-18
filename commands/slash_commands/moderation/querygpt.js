const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const fetch = require('node-fetch');
const path = require("path");

module.exports = {
    name: `querygpt`,
    description: `Query ChatGPT and receive a helpful response`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `query`,
        description: `Information to query for`,
        type: ApplicationCommandOptionType.String,
        required: true,
    }, {
        name: `target`,
        description: `User to mention`,
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const query = options.getString('query');
        const target = options.getUser('target');

        try {
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OAI_KEY}`
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo-0301",
                    "messages": [
                        { "role": "system", "content": `Give short meaningful responses` },
                        { "role": "user", "content": query }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 512
                })
            })
                .then(res => res.json())
                .then(async data => {
                    if (!data || !data.choices) {
                        sendResponse(interaction, `Unable to generate a response. Try again`);
                    } else {
                        channel.send({
                            content: `*Information for ${target}:*
> ${process.env.BOT_DOC} ${data.choices[0].message.content}`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                });
        } catch (err) {
            console.error('There was a problem: ', err);
        }

        sendResponse(interaction, `Query sent!`);
    }
}