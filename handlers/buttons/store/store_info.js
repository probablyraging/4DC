const { CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow } = require("discord.js");
const storeList = require('../../../lists/store');
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    const { guild, member, customId, channel } = interaction;

    await interaction.deferUpdate();

    let embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('Home')
        .setDescription(storeList.home)

    const btn = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-home')
                .setLabel('Home')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('storeinfo-earn')
                .setLabel('How To Earn Tokens')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-store')
                .setLabel('Tokens Store')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-disclaimer')
                .setLabel('Disclaimer')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        );
    const btn2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-epic')
                .setLabel('Epic Tier')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-legendary')
                .setLabel('Legendary Tier')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-rare')
                .setLabel('Rare Tier')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-common')
                .setLabel('Common Tier')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-rank')
                .setLabel('Rank & XP')
                .setStyle(ButtonStyle.Primary)
        );
    const pageBtn = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-back')
                .setLabel('Back')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-one')
                .setLabel('1')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-two')
                .setLabel('2')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-three')
                .setLabel('3')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        );
    const pageBtn2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-back')
                .setLabel('Back')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-one')
                .setLabel('1')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-two')
                .setLabel('2')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-three')
                .setLabel('3')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-four')
                .setLabel('4')
                .setStyle(ButtonStyle.Primary),
        );
    const pageBtn22 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-page-five')
                .setLabel('5')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-six')
                .setLabel('6')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-seven')
                .setLabel('7')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        )
    const pageBtn3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-back')
                .setLabel('Back')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-one')
                .setLabel('1')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-two')
                .setLabel('2')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-three')
                .setLabel('3')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-four')
                .setLabel('4')
                .setStyle(ButtonStyle.Primary),
        );
    const pageBtn33 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('storeinfo-page-five')
                .setLabel('5')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-six')
                .setLabel('6')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-page-seven')
                .setLabel('7')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('storeinfo-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        )

    // Initial
    let dmError;
    if (customId.split('-')[1] === 'btn') {
        member.send({
            embeds: [embed],
            components: [btn]
        }).catch(() => {
            dmError = true;
            interaction.followUp({
                content: `${process.env.BOT_DENY} I was unable to send you a DM. Please make sure you can receive DMs and try again`,
                ephemeral: true
            })
        })
    }

    //Navigation
    // Home
    if (customId.split('-')[1] === 'home') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('home')) return;
            embed.setTitle('Home');
            embed.setDescription(storeList.home);
            reply.edit({ embeds: [embed], components: [btn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Back
    if (customId.split('-')[1] === 'back') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('tokens store')) return;
            embed.setTitle('Tokens Store');
            embed.setDescription(storeList.store);
            reply.edit({ embeds: [embed], components: [btn, btn2] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Delete
    if (customId.split('-')[1] === 'delete') {
        interaction.fetchReply('@original').then(reply => reply.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err)));
    }

    //Pages
    // Earn
    if (customId.split('-')[1] === 'earn') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('how to')) return;
            embed.setTitle('How To Earn Tokens');
            embed.setDescription(storeList.earn);
            reply.edit({ embeds: [embed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Store
    if (customId.split('-')[1] === 'store') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('tokens store')) return;
            embed.setTitle('Tokens Store');
            embed.setDescription(storeList.store);
            reply.edit({ embeds: [embed], components: [btn, btn2] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Disclaimer
    if (customId.split('-')[1] === 'disclaimer') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('Disclaimer')) return;
            embed.setTitle('Disclaimer');
            embed.setDescription(storeList.disclaimer);
            reply.edit({ embeds: [embed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }

    // Store Pages
    // Epic
    if (customId.split('-')[1] === 'epic') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('epic tier')) return;
            embed.setTitle('Epic Tier');
            embed.setDescription(storeList.epic[0]);
            reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Legendary
    if (customId.split('-')[1] === 'legendary') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('legendary tier')) return;
            embed.setTitle('Legendary Tier');
            embed.setDescription(storeList.legendary[0]);
            reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Rare
    if (customId.split('-')[1] === 'rare') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('rare tier')) return;
            embed.setTitle('Rare Tier');
            embed.setDescription(storeList.rare[0]);
            reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Common
    if (customId.split('-')[1] === 'common') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('common tier')) return;
            embed.setTitle('Common Tier');
            embed.setDescription(storeList.common[0]);
            reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Rank & XP
    if (customId.split('-')[1] === 'rank') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('rank and xp')) return;
            embed.setTitle('Rank And XP');
            embed.setDescription(storeList.rank[0]);
            reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }

    // Store Tier Page Navigation
    if (customId.split('-')[1] === 'page') {
        interaction.fetchReply('@original').then(reply => {
            // Epic
            if (reply.embeds[0].title.toLowerCase().includes('epic')) {
                if (customId.split('-')[2] === 'one') {
                    embed.setTitle('Epic Tier - Amazon Giftcard');
                    embed.setDescription(storeList.epic[1]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'two') {
                    embed.setTitle('Epic Tier - Nitro');
                    embed.setDescription(storeList.epic[2]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'three') {
                    embed.setTitle('Epic Tier - Nitro Basic');
                    embed.setDescription(storeList.epic[3]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
            }
            // Legendary
            if (reply.embeds[0].title.toLowerCase().includes('legendary')) {
                if (customId.split('-')[2] === 'one') {
                    embed.setTitle('Legendary Tier - Giveaway Channel');
                    embed.setDescription(storeList.legendary[1]);
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'two') {
                    embed.setTitle('Legendary Tier - Premium Ad');
                    embed.setDescription(storeList.legendary[2]);
                    embed.setImage('https://i.imgur.com/R7ZIsOD.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'three') {
                    embed.setTitle('Legendary Tier - YouTube Auto');
                    embed.setDescription(storeList.legendary[4]);
                    embed.setImage('https://i.imgur.com/b3ZnRoN.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'four') {
                    embed.setTitle('Legendary Tier - Twitch Auto');
                    embed.setDescription(storeList.legendary[5]);
                    embed.setImage('https://i.imgur.com/83N3K8p.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'five') {
                    embed.setTitle('Legendary Tier - Live Now Role');
                    embed.setDescription(storeList.legendary[3]);
                    embed.setImage('https://i.imgur.com/V06rscp.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'six') {
                    embed.setTitle('Legendary Tier - Custom Role');
                    embed.setDescription(storeList.legendary[6]);
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
            }
            // Rare
            if (reply.embeds[0].title.toLowerCase().includes('rare')) {
                if (customId.split('-')[2] === 'one') {
                    embed.setTitle('Rare Tier - Giveaway Channel');
                    embed.setDescription(storeList.rare[1]);
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'two') {
                    embed.setTitle('Rare Tier - Premium Ad');
                    embed.setDescription(storeList.rare[2]);
                    embed.setImage('https://i.imgur.com/R7ZIsOD.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'three') {
                    embed.setTitle('Rare Tier - YouTube Auto');
                    embed.setDescription(storeList.rare[4]);
                    embed.setImage('https://i.imgur.com/b3ZnRoN.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'four') {
                    embed.setTitle('Rare Tier - Twitch Auto');
                    embed.setDescription(storeList.rare[5]);
                    embed.setImage('https://i.imgur.com/83N3K8p.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'five') {
                    embed.setTitle('Rare Tier - Live Now Role');
                    embed.setDescription(storeList.rare[3]);
                    embed.setImage('https://i.imgur.com/V06rscp.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'six') {
                    embed.setTitle('Rare Tier - Custom Role');
                    embed.setDescription(storeList.rare[6]);
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'seven') {
                    embed.setTitle('Rare Tier - Link Embeds');
                    embed.setDescription(storeList.rare[7]);
                    embed.setImage('https://i.imgur.com/XAl7IYn.png')
                    reply.edit({ embeds: [embed], components: [pageBtn2, pageBtn22] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
            }
            // Common
            if (reply.embeds[0].title.toLowerCase().includes('common')) {
                if (customId.split('-')[2] === 'one') {
                    embed.setTitle('Common Tier - Emoji or Sticker');
                    embed.setDescription(storeList.common[1]);
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'two') {
                    embed.setTitle('Common Tier - YouTube Auto');
                    embed.setDescription(storeList.common[2]);
                    embed.setImage('https://i.imgur.com/b3ZnRoN.png')
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'three') {
                    embed.setTitle('Common Tier - Twitch Auto');
                    embed.setDescription(storeList.common[3]);
                    embed.setImage('https://i.imgur.com/83N3K8p.png')
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'four') {
                    embed.setTitle('Common Tier - Live Now Role');
                    embed.setDescription(storeList.common[4]);
                    embed.setImage('https://i.imgur.com/V06rscp.png')
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'five') {
                    embed.setTitle('Common Tier - Spotlight Entry');
                    embed.setDescription(storeList.common[5]);
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'six') {
                    embed.setTitle('Common Tier - Game Save');
                    embed.setDescription(storeList.common[6]);
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'seven') {
                    embed.setTitle('Common Tier - Link Embeds');
                    embed.setDescription(storeList.common[7]);
                    embed.setImage('https://i.imgur.com/XAl7IYn.png')
                    reply.edit({ embeds: [embed], components: [pageBtn3, pageBtn33] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
            }
            // Rank & XP
            if (reply.embeds[0].title.toLowerCase().includes('rank')) {
                if (customId.split('-')[2] === 'one') {
                    embed.setTitle('Rank And XP - Skip Current Rank');
                    embed.setDescription(storeList.rank[1]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'two') {
                    embed.setTitle('Rank And XP - Double XP *(1-week)*');
                    embed.setDescription(storeList.rank[2]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
                if (customId.split('-')[2] === 'three') {
                    embed.setTitle('Rank And XP - Double XP *(24-hours)*');
                    embed.setDescription(storeList.rank[3]);
                    reply.edit({ embeds: [embed], components: [pageBtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }
            }
        });
    }
}