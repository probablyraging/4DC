const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, bold } = require('discord.js');
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
        choices: [{ name: 'welcome', value: 'welcome' },
        { name: 'rules', value: 'rules' },
        { name: 'serverguide', value: 'serverguide' },
        { name: 'faqs', value: 'faqs' },
        { name: 'spotlight', value: 'spotlight' },
        { name: 'tokenstore', value: 'tokenstore' }]
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

        // WELCOME
        switch (options.getString('data')) {
            case 'welcome': {
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

            // RULES
            case 'rules': {
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.rules.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.rules[i]}`,
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
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.servermap.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.servermap[i]}`,
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

            // FAQ SERVER
            case 'faqs': {
                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.faqs.length; i++) {
                        setTimeout(function () {
                            if (channel.type === 15) {
                                webhook.send({
                                    content: `${index.faqs[i]}`,
                                    threadId: threadId,
                                    allowedMentions: {
                                        parse: []
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            } else {
                                webhook.send({
                                    content: `${index.faqs[i]}`,
                                    allowedMentions: {
                                        parse: []
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            }
                        }, i * 1000);
                    }
                    setTimeout(() => {
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
Buy entry tickets from <#1049791650060324954> to have your content featured here. The more tickets you buy, the better your chance of winning`);

                channel.send({ embeds: [liveNowEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // TOKENS STORE
            case 'tokenstore': {
                const btn = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('perm-one')
                            .setLabel('⠀⠀800⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('perm-two')
                            .setLabel('⠀⠀800⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('perm-three')
                            .setLabel('⠀⠀300⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary)
                    );
                const gift = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('giftperm-one')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('giftperm-two')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('giftperm-three')
                            .setLabel('⠀⠀ Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success)
                    );
                const info = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('info-perm-one')
                            .setLabel('⠀ Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-perm-two')
                            .setLabel('⠀ Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-perm-three')
                            .setLabel('⠀Information⠀⠀')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await channel.send({
                    content: bold('PERMANENT ACCESS'),
                    files: ['./res/images/token_store_perm.png'],
                    components: [btn, gift, info]
                }).catch(err => console.error(`Could not send a message: `, err));

                const btn2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('temp-one')
                            .setLabel('⠀ ⠀100⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('temp-two')
                            .setLabel('⠀ ⠀100⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('temp-three')
                            .setLabel('⠀ ⠀30⠀ ⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary)
                    );
                const gift2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('gifttemp-one')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('gifttemp-two')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('gifttemp-three')
                            .setLabel('⠀⠀ Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success)
                    );
                const info2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('info-temp-one')
                            .setLabel('⠀ Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-temp-two')
                            .setLabel('⠀ Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-temp-three')
                            .setLabel('⠀Information⠀⠀')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await channel.send({
                    content: bold('\n1 WEEK ACCESS'),
                    files: ['./res/images/token_store_perm.png'],
                    components: [btn2, gift2, info2]
                }).catch(err => console.error(`Could not send a message: `, err));

                const btn3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('misc-one')
                            .setLabel('⠀ ⠀100⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('misc-two')
                            .setLabel('⠀⠀ ⠀5⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('misc-three')
                            .setLabel('⠀ ⠀ ⠀1⠀⠀⠀⠀')
                            .setEmoji('1050596938921295973')
                            .setStyle(ButtonStyle.Primary)
                    );
                const gift3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('giftmisc-one')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('giftmisc-two')
                            .setLabel('⠀⠀Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('giftmisc-three')
                            .setLabel('⠀⠀ Gift⠀⠀⠀')
                            .setEmoji('1053389293424480326')
                            .setStyle(ButtonStyle.Success)
                    );
                const info3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('info-misc-one')
                            .setLabel('⠀ Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-misc-two')
                            .setLabel('⠀Information⠀')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('info-misc-three')
                            .setLabel('⠀Information⠀⠀')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await channel.send({
                    content: bold('\nMISCELLANEOUS'),
                    files: ['./res/images/token_store_misc.png'],
                    components: [btn3, gift3, info3]
                }).catch(err => console.error(`Could not send a message: `, err));

                break;
            }
        }
    }
}