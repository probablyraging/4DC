const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { ImgurClient } = require('imgur');
const path = require('path');

module.exports = {
    name: `embed`,
    description: `Create a new embed or edit an existing one`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `create`,
        description: `Create a new embed`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `description`,
            description: `The description for the embed`,
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: `title`,
            description: `The title for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false
        }, {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: ApplicationCommandOptionType.String,
            required: false
        }, {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: ApplicationCommandOptionType.Attachment,
            required: false
        }, {
            name: `image`,
            description: `The image URL for the embed`,
            type: ApplicationCommandOptionType.Attachment,
            required: false
        }, {
            name: `author`,
            description: `Do you want to show who created this embed?`,
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }]
    }, {
        name: `edit`,
        description: `Edit an existing embed`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `message_id`,
            description: `The id of the message containing the embed you want to edit`,
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: `description`,
            description: `The description for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false
        }, {
            name: `title`,
            description: `The title for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false
        }, {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: ApplicationCommandOptionType.String,
            required: false
        }, {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: ApplicationCommandOptionType.Attachment,
            required: false
        }, {
            name: `image`,
            description: `The image URL for the embed`,
            type: ApplicationCommandOptionType.Attachment,
            required: false
        }, {
            name: `author`,
            description: `Do you want to show who created this embed?`,
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }]
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { user, channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        switch (options.getSubcommand()) {
            case 'create': {
                const title = options.getString('title');
                const description = options.getString('description');
                const color = options.getString('color') || '#32BEA6';
                const thumbnail = options.getAttachment('thumbnail');
                const image = options.getAttachment('image');
                const author = options.getBoolean('author');

                // Perform character limit checks
                if (title + description + author > 6000) return sendResponse(interaction, `${process.env.BOT_DENY} The sum of all characters from all embed structures in a message must not exceed 6000 characters`);
                if (title && title.length > 256) return sendResponse(interaction, `${process.env.BOT_DENY} Embed titles are limited to 256 characters`);
                if (description && description.length > 4096) return sendResponse(interaction, `${process.env.BOT_DENY} Embed descriptions are limited to 4096 characters`);
                // Make sure the color provided is a valid HEX code
                const hexRegex = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/i;
                const isHex = hexRegex.test(color);
                if (color && !isHex) return sendResponse(interaction, `${process.env.BOT_DENY} You must enter a valid #hex color`);
                // Create the embed
                const embed = new EmbedBuilder().setDescription(description).setColor(color);
                // Add any provided fields to the embed
                if (title) embed.setTitle(title);
                if (thumbnail) embed.setThumbnail(thumbnail.url);
                if (image) embed.setImage(image.url);
                if (author) embed.setFooter({ text: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) });
                // Send the embed
                await channel.send({
                    embeds: [embed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                // Delete the initial interaction
                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
                break;
            }

            case 'edit': {
                const id = options.getString('message_id');
                const title = options.getString('title');
                const description = options.getString('description');
                const color = options.getString('color');
                const author = options.getBoolean('author');
                let thumbnail = options.getAttachment('thumbnail');
                let image = options.getAttachment('image');

                // Upload images to imgur
                if (thumbnail) {
                    // Create a new imgur client
                    const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });
                    // Upload attachment to imgur, get the link and attach it to the embed
                    const response = await imgur.upload({
                        image: thumbnail.url,
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));
                    // Update the variable with the returned imgur URL
                    if (response.length > 0) {
                        if (response[0].status !== 200) return;
                        thumbnail = response[0].data.link;
                    }
                }
                if (image) {
                    // Create a new imgur client
                    const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });
                    // Upload attachment to imgur, get the link and attach it to the embed
                    const response = await imgur.upload({
                        image: image.url,
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));
                    // Update the variable with the returned imgur URL
                    if (response.length > 0) {
                        if (response[0].status !== 200) return;
                        image = response[0].data.link;
                    }
                }

                // Make sure the message ID is valid
                const letterRegex = /[a-zA-Z]/g;
                const hasLetter = letterRegex.test(id);
                if (hasLetter === true) return sendResponse(interaction, `${process.env.BOT_DENY} You must enter a valid message id`);

                // Perform character limit checks
                if (title + description + author > 6000) return sendResponse(interaction, `${process.env.BOT_DENY} The sum of all characters from all embed structures in a message must not exceed 6000 characters`);
                if (title && title.length > 256) return sendResponse(interaction, `${process.env.BOT_DENY} Embed titles are limited to 256 characters`);
                if (description && description.length > 4096) return sendResponse(interaction, `${process.env.BOT_DENY} Embed descriptions are limited to 4096 characters`);
                // Make sure the color provided is a valid HEX code
                const hexRegex = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/i;
                const isHex = hexRegex.test(color);
                if (color && !isHex) return sendResponse(interaction, `${process.env.BOT_DENY} You must enter a valid #hex color`);

                // Fetch the target message containing the embed
                const message = await channel.messages.fetch(id);
                const embed = message?.embeds[0];

                // Edit any provided fields
                if (title) editEmbed = EmbedBuilder.from(embed)
                    .setTitle(title)
                if (description) editEmbed = EmbedBuilder.from(embed)
                    .setDescription(description)
                if (color) editEmbed = EmbedBuilder.from(embed)
                    .setColor(color)
                if (thumbnail) editEmbed = EmbedBuilder.from(embed)
                    .setThumbnail(thumbnail)
                if (image) editEmbed = EmbedBuilder.from(embed)
                    .setImage(image)
                if (author) editEmbed = EmbedBuilder.from(embed)
                    .setFooter({ text: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) });

                // Edit the embed
                await message.edit({ embeds: [editEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                // Delete the initial interaction
                interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
                break;
            }
        }
    }
};
