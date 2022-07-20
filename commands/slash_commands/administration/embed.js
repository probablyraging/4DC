const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `embed`,
    description: `Create a new embed or edit an existing one`,
    access: 'owner',
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `create`,
        description: `Create a new embed`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/embed create [description] (title) (color) (thumbnail) (image) (author)`,
        options: [{
            name: `description`,
            description: `The description for the embed`,
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: `title`,
            description: `The title for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `image`,
            description: `The image URL for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `author`,
            description: `Do you want to show who created this embed?`,
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [{ name: `yes`, value: `yes` }],
        }],
    },
    {
        name: `edit`,
        description: `Edit an existing embed`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/embed edit [description] (title) (color) (thumbnail) (image) (author)`,
        options: [{
            name: `id`,
            description: `The id of the message containing the embed you want to edit`,
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: `description`,
            description: `The description for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `title`,
            description: `The title for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: `image`,
            description: `The image URL for the embed`,
            type: ApplicationCommandOptionType.String,
            required: false,
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { user, channel, options } = interaction;

        switch (options.getSubcommand()) {
            case 'create': {
                const title = options.getString('title');
                const description = options.getString('description');
                const color = options.getString('color') || '#32BEA6';
                const thumbnail = options.getString('thumbnail');
                const image = options.getString('image');
                const author = options.getString('author');

                if (title + description + author > 6000) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`The sum of all characters from all embed structures in a message must not exceed 6000 characters\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                if (title && title.length > 256) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`Embed titles are limited to 256 characters\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                if (description && description.length > 4096) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`Embed descriptions are limited to 4096 characters\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                if (image && !image.toLowerCase().startsWith('https://') && !image.toLowerCase().startsWith('http://')) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`Embed image and thumbnail urls must start with one of ('https://', 'http://')\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                const hexRegex = /^#[0-9A-F]{6}$/i;
                const isHex = hexRegex.test(color);

                if (!isHex) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`You must enter a valid #hex color\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                const create = new EmbedBuilder()
                    .setDescription(`${description}`)
                    .setColor(`${color}`)

                if (title) create.setTitle(`${title}`);
                if (thumbnail) create.setThumbnail(`${thumbnail}`);
                if (image) create.setImage(`${image}`);
                if (author === 'yes') create.setFooter({ text: `Created by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })

                channel.send({
                    embeds: [create],
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(() => {
                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Embed created and sent\``,
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(() => setTimeout(() => {
                        interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
                    }, 1500));
                });

            }
        }
        switch (options.getSubcommand()) {
            case 'edit': {
                const id = options.getString('id');
                const title = options.getString('title');
                const description = options.getString('description');
                const color = options.getString('color');
                const thumbnail = options.getString('thumbnail');
                const image = options.getString('image');

                const letterRegex = /[a-zA-Z]/g;
                const hasLetter = letterRegex.test(id);

                const hexRegex = /^#[0-9A-F]{6}$/i;
                const isHex = hexRegex.test(color);

                if (hasLetter === true) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`You must enter a valid message id\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                if (color && isHex === false) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} \`You must enter a valid #hex color\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                channel.messages.fetch(id).then(fetched => {
                    let embed = fetched?.embeds[0];

                    if (!embed) {
                        interaction.reply({
                            content: `${process.env.BOT_DENY} \`This message does not contain an embed\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    } else {
                        if (title) embed.setTitle(`${title}`);
                        if (description) embed.setDescription(`${description}`);
                        if (color) embed.setColor(`${color}`);
                        if (thumbnail) embed.setThumbnail(`${thumbnail}`);
                        if (image) embed.setImage(`${image}`);

                        fetched.edit({ embeds: [embed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));

                        interaction.reply({
                            content: `${process.env.BOT_CONF} \`Embed edited successfully\``,
                        }).then(() => setTimeout(() => {
                            interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
                        }, 1500));
                    }
                });
            }
        }
    }
}