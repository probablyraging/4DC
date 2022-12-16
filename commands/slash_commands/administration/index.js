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
        { name: 'selfroles', value: 'selfroles' },
        { name: 'spotlight', value: 'spotlight' },
        { name: 'tokenstore', value: 'tokenstore' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        let { client, guild, channel, options } = interaction;

        const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

        if (channel.type === 11) {
            threadId = channel.id
            channel = await guild.channels.cache.get(channel.parentId);
        }

        // WELCOME
        switch (options.getString('data')) {
            case 'welcome': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

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
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

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
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

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
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

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

            // SELF ROLES
            case 'selfroles': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                // Colors
                // const btnColorsOne = new ActionRowBuilder()
                //     .addComponents(
                //         new ButtonBuilder()
                //             .setCustomId('color-blue')
                //             .setLabel('Blue')
                //             .setEmoji('996661870461210655')
                //             .setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder()
                //             .setCustomId('color-red')
                //             .setLabel('Red')
                //             .setEmoji('996661868011716670')
                //             .setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder()
                //             .setCustomId('color-green')
                //             .setLabel('Green')
                //             .setEmoji('996661865784545302')
                //             .setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder()
                //             .setCustomId('color-orange')
                //             .setLabel('Orange')
                //             .setEmoji('996661864371081336')
                //             .setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder()
                //             .setCustomId('color-yellow')
                //             .setLabel('Yellow')
                //             .setEmoji('996661862714327080')
                //             .setStyle(ButtonStyle.Secondary)
                //     );
                // const btnColorsTwo = new ActionRowBuilder()
                //     .addComponents(
                //         new ButtonBuilder()
                //             .setCustomId('color-pink')
                //             .setLabel('Pink')
                //             .setEmoji('996661860080304138')
                //             .setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder()
                //             .setCustomId('color-purple')
                //             .setLabel('Purple')
                //             .setEmoji('996661858025099275')
                //             .setStyle(ButtonStyle.Secondary)
                //     );

                const btnPlatformsOne = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('platform-twitch')
                            .setLabel('Twitch')
                            .setEmoji('837083090283003964')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-youtube')
                            .setLabel('YouTube')
                            .setEmoji('837083090441994240')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-instagram')
                            .setLabel('Instagram')
                            .setEmoji('837325424744595466')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-tiktok')
                            .setLabel('TikTok')
                            .setEmoji('837325423712796762')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-snapchat')
                            .setLabel('Snapchat')
                            .setEmoji('1003006430065983488')
                            .setStyle(ButtonStyle.Secondary)
                    );
                const btnPlatformsTwo = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('platform-spotify')
                            .setLabel('Spotify')
                            .setEmoji('1003022473702412318')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-soundcloud')
                            .setLabel('SoundCloud')
                            .setEmoji('1003021533272346664')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-developer')
                            .setLabel('Developer')
                            .setEmoji('1003006427117391892')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-writer')
                            .setLabel('Writer')
                            .setEmoji('1003006425301266512')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-musician')
                            .setLabel('Musician')
                            .setEmoji('1003021536292257913')
                            .setStyle(ButtonStyle.Secondary),
                    );
                const btnPlatformsThree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('platform-photographer')
                            .setLabel('Photographer')
                            .setEmoji('1003104549629870230')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('platform-artist')
                            .setLabel('Artist')
                            .setEmoji('1049261103219212288')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Ages
                const btnAges = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('age-groupone')
                            .setLabel('13-17')
                            .setEmoji('👶')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('age-grouptwo')
                            .setLabel('18-29')
                            .setEmoji('👦')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('age-groupthree')
                            .setLabel('30+')
                            .setEmoji('👨')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Regions
                const btnRegions = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('region-america')
                            .setLabel('America')
                            .setEmoji('🏈')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('region-europe')
                            .setLabel('Europe')
                            .setEmoji('🎡')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('region-oceania')
                            .setLabel('Oceania')
                            .setEmoji('🏝️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('region-asia')
                            .setLabel('Asia')
                            .setEmoji('🐉')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('region-africa')
                            .setLabel('Africa')
                            .setEmoji('🦁')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Genders
                const btnGenders = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('gender-male')
                            .setLabel('Male')
                            .setEmoji('🙋‍♂️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('gender-female')
                            .setLabel('Female')
                            .setEmoji('🙋‍♀️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('gender-binary')
                            .setLabel('Non-binary')
                            .setEmoji('🙋')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Customs
                const btnCustoms = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('custom-announcements')
                            .setLabel('Announcements')
                            .setEmoji('📢')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('custom-deals')
                            .setLabel('Game Deals')
                            .setEmoji('🎲')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('custom-bump')
                            .setLabel('Bump Ping')
                            .setEmoji('📣')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await channel.send({ content: `https://i.imgur.com/LOJ7arf.png` }).catch(err => console.error(`Could not send a message: `, err));

                //                 await channel.send({
                //                     content: `**Press a button below to add your role. Press it again to remove it**

                // **Choose your nickname color**`, components: [btnColorsOne, btnColorsTwo]
                //                 }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `**Press a button below to add your role. Press it again to remove it**

**Choose your content types**`, components: [btnPlatformsOne, btnPlatformsTwo, btnPlatformsThree]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your age**`, components: [btnAges]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your region**`, components: [btnRegions]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your gender**`, components: [btnGenders]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your optional pings**`, components: [btnCustoms]
                }).catch(err => console.error(`Could not send a message: `, err));

                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

                break;
            }

            // SPOTLIGHT CHANNEL
            case 'spotlight': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

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
                await interaction.deferReply({ ephemeral: true });
                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));

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
                    components: [btn, info]
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
                    components: [btn2, info2]
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
                    components: [btn3, info3]
                }).catch(err => console.error(`Could not send a message: `, err));

                break;
            }
        }
    }
}