const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const index = require('../../../lists/index');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `data`,
        description: `Data to send`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'welcome', value: 'welcome' },
        { name: 'rules', value: 'rules' },
        { name: 'servermap', value: 'servermap' },
        { name: 'faqs', value: 'faqs' },
        { name: 'usefullinks', value: 'usefullinks' },
        { name: 'creatorcrew', value: 'creatorcrew' },
        { name: 'selfroles', value: 'selfroles' },
        { name: 'featuredstream', value: 'featuredstream' }]
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
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

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // WELCOME
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

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // SERVER MAP
            case 'servermap': {
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

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

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

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // USEFUL LINKS
            case 'usefullinks': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.usefullinks.length; i++) {
                        setTimeout(function () {
                            if (channel.type === 15) {
                                webhook.send({
                                    content: `${index.usefullinks[i]}`,
                                    threadId: threadId,
                                    allowedMentions: {
                                        parse: []
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            } else {
                                webhook.send({
                                    content: `${index.usefullinks[i]}`,
                                    allowedMentions: {
                                        parse: []
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            }
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // CREATOR CREW
            case 'creatorcrew': {
                const response = new EmbedBuilder()
                    .setColor('#32BEA6')
                    .setDescription(`${index.creatorcrew}`)

                channel.send({
                    embeds: [response]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

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

                await channel.send({ content: `https://www.forthecontent.xyz/images/creatorhub/banner_selfroles.png` }).catch(err => console.error(`Could not send a message: `, err));

//                 await channel.send({
//                     content: `**Press a button below to add your role. Press it again to remove it**

// **Choose your nickname color**`, components: [btnColorsOne, btnColorsTwo]
//                 }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
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

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // FEATURED STREAM
            case 'featuredstream': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                const liveNowEmbed = new EmbedBuilder()
                    .setColor("#9c59ff")
                    .setTitle(`🎥 Featured Stream`)
                    .setDescription(`**What Is It?**
A server member who is currently streaming on either Twitch or YouTube will be picked at random to be featured in this channel, they will also be given the <@&998861546530820207> role. After 2 hours, the channel will be reset and a new streamer will be featured`);

                channel.send({ embeds: [liveNowEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }
        }
    }
}