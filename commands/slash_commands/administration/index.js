const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const index = require('../../../lists/index');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `data`,
        description: `Data to send`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'welcome', value: 'welcome' },
        { name: 'rules', value: 'rules' },
        { name: 'serverguide', value: 'serverguide' },
        { name: 'faqs', value: 'faqs' },
        { name: 'auth', value: 'auth' }]
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

        switch (options.getString('data')) {
            // WELCOME
            case 'welcome': {
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    webhook.send({
                        content: `${index.welcome[0]}`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // RULES
            case 'rules': {
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    webhook.send({
                        embeds: [new EmbedBuilder().setTitle('SERVER RULES').setDescription('By participating in this server, you agree to the following').setColor('#2B2D31').setThumbnail('https://i.imgur.com/LRi2593.png')],
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                    webhook.send({
                        content: `${index.rules[0]}`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
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
                    webhook.send({
                        embeds: [new EmbedBuilder().setTitle('CHANNELS & ROLES').setDescription(`A detailed list of all the server's channels and roles`).setColor('#2B2D31').setThumbnail('https://i.imgur.com/nkUXwJK.png')],
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
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
                    webhook.send({
                        embeds: [new EmbedBuilder().setTitle('FAQ & USEFUL LINKS').setDescription(`A compilation of frequently asked question and useful links`).setColor('#2B2D31').setThumbnail('https://i.imgur.com/2ue2min.png')],
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
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

            // AUTH GUIDE
            case 'auth': {
                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('auth-start')
                            .setLabel('Start Verification')
                            .setStyle(ButtonStyle.Primary)
                    );

                channel.send({
                    content: `## Verification \nIn order to access the content on this server, you must verify that you are human \nPlease click the button below to begin the verification process \n\nIf you have any issues, please contact <@438434841617367080> \n⠀`,
                    components: [button],
                    allowedMentions: {
                        parse: []
                    }
                });

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }
        }
    }
}