const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../../modules/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    const { guild, member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = 'Giveaway Channel', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'Premium Ad', btnIndex = 1;
    if (itemIndex === 'three') itemName = 'YouTube Auto', btnIndex = 2;
    if (itemIndex === 'four') itemName = 'Twitch Auto', btnIndex = 0;
    if (itemIndex === 'five') itemName = 'Live Now Role', btnIndex = 1;
    if (itemIndex === 'six') itemName = 'Custom Role', btnIndex = 2;
    if (itemIndex === 'seven') itemName = 'Link Embeds', btnIndex = 0;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            const giveawayChan = guild.channels.cache.get(process.env.GIVEAWAY_CHAN);
            // Edit the channel permissions for the user to give them access
            giveawayChan.permissionOverwrites.edit(member.id, {
                ViewChannel: true,
            }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

            // Future timestamp for auto expiry
            const threeMonths = 24 * 60 * 60 * 30 * 3 * 1000;
            const timestamp = new Date().valueOf() + threeMonths;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                giveaways: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }

    // Two
    if (itemIndex === 'two') {
        customMessage = `\n\nPlease contact a staff member to complete your purchase`;
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Attempt to complete the purchase and continue if successful
        await completePurchase(interaction, cost, itemName, customMessage)
    }

    // Three
    if (itemIndex === 'three') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE)) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.youtubeauto - new Date()) > 1 || results[0]?.youtubeauto === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            const channelId = interaction.fields.getTextInputValue('input2');
            // Future timestamp for auto expiry
            const threeMonths = 24 * 60 * 60 * 30 * 3 * 1000;
            const timestamp = new Date().valueOf() + threeMonths;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                youtubeauto: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            try {
                // We need to store a list of the user's current video IDs
                const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
                const items = resolve.items;
                let videoIdArr = [];
                items.forEach(item => {
                    // Remove the XML markup from video IDs
                    const regex = item.id.replace('yt:video:', '');
                    videoIdArr.push(regex);
                });
                await ytNotificationSchema.updateOne({
                    userId: member.id,
                }, {
                    userId: member.id,
                    channelId: channelId,
                    videoIds: videoIdArr,
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            } catch {
                // If an error occurs
                interaction.editReply({
                    content: `${process.env.BOT_DENY} An error occurred. Please contact a staff member for help`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }
    }

    // Four
    if (itemIndex === 'four') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE)) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.twitchauto - new Date()) > 1 || results[0]?.twitchauto === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Future timestamp for auto expiry
            const threeMonths = 24 * 60 * 60 * 30 * 3 * 1000;
            const timestamp = new Date().valueOf() + threeMonths;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                youtubeauto: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }

    // Five
    if (itemIndex === 'five') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE)) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.livenow - new Date()) > 1 || results[0]?.livenow === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Future timestamp for auto expiry
            const threeMonths = 24 * 60 * 60 * 30 * 3 * 1000;
            const timestamp = new Date().valueOf() + threeMonths;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                livenow: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }

    // Six
    if (itemIndex === 'six') {
        customMessage = `\n\nIf you would like a custom role icon, please contact a staff member`;

        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE)) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        const roleName = interaction.fields.getTextInputValue('input5');
        const roleColor = interaction.fields.getTextInputValue('input6');

        // Make sure the role color is a HEX color
        const regex = /^#[0-9A-F]{6}$/i;
        const isHexColor = regex.test(roleColor);

        if (!isHexColor) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} The role color must be a valid HEX color *(e.g. #F4F4F4)*. You can use this color chart to pick a color <https://www.google.com/search?q=hex%20color%20picker>`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Future timestamp for auto expiry
            const threeMonths = 24 * 60 * 60 * 30 * 3 * 1000;
            const timestamp = new Date().valueOf() + threeMonths;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                customrole: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            // Allow the user to create their new role
            guild.roles.create({
                name: roleName,
                color: roleColor,
                position: 51,
                hoist: true,
                mentionable: true,
                permissions: []
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a role: `, err)).then(newRole => {
                // Add the user the the new role
                member.roles.add(newRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
            });
        }
    }

    // Six
    if (itemIndex === 'seven') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE)) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.linkembeds - new Date()) > 1 || results[0]?.linkembeds === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            const contentShare = guild.channels.cache.get(process.env.CONTENT_SHARE);
            // Edit the channel permissions for the user to allow link embeds  
            contentShare.permissionOverwrites.edit(member.id, {
                EmbedLinks: true,
            }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                linkembeds: true
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }
}