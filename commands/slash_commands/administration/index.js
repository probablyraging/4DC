const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const index = require('../../../lists/index');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `data`,
        description: `Data to send`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'rules', value: 'rules' },
        { name: 'serverguide', value: 'serverguide' },
        { name: 'faqs', value: 'faqs' },
        { name: 'spotlight', value: 'spotlight' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        let { client, guild, channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

        // If the command is ran in a thread channel
        if (channel.type === 11) {
            threadId = channel.id
            channel = guild.channels.cache.get(channel.parentId);
        }

        // RULES
        switch (options.getString('data')) {
            case 'rules': {
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.welcome.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.welcome[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // SERVER GUIDE
            case 'serverguide': {
                let initMessage = [];
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.servermap.length; i++) {
                        setTimeout(async function () {
                            const message = await webhook.send({
                                content: `${index.servermap[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            initMessage.push(message.url);
                            if (i === index.servermap.length - 1) webhook.send({
                                content: `⠀\n<:uparrow:1096217298076958785> [Jump to top](${initMessage[0]})`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // FAQ SERVER
            case 'faqs': {
                let initMessage = [];
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.faqs.length; i++) {
                        setTimeout(async function () {
                            const message = await webhook.send({
                                content: `${index.faqs[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            initMessage.push(message.url);
                            if (i === index.faqs.length - 1) webhook.send({
                                content: `⠀\n<:uparrow:1096217298076958785> [Jump to top](${initMessage[0]})`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(async () => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 20000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // SPOTLIGHT CHANNEL
            case 'spotlight': {
                const liveNowEmbed = new EmbedBuilder()
                    .setColor("#9c59ff")
                    .setTitle(`:crown: Content Spotlight`)
                    .setDescription(`**How Does It Work?**
Every 2 hours the channel will unlock, allowing anyone to post a single link to their content`);

                channel.send({ embeds: [liveNowEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }
        }
    }
}