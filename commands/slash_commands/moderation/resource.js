const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require('path');

module.exports = {
    name: "resource",
    description: "Create a new resource embed in the resource channel",
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 10,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `add`,
        description: `Create a new resource embed in the resource channel`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `link`,
            description: `Supply a link to a Google doc`,
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "thumbnail",
            description: "Supply a thumbnail to use for the resource embed",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options, guild } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const link = options.getString('link');
        const attachment = options.getAttachment('thumbnail');
        const resChan = guild.channels.cache.get(process.env.RES_CHAN);

        if (!attachment.contentType.includes('image')) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} Attachment type must be an image file (png, jpg, etc..)`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        const gdoc = await resChan.send({ content: link }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // Allow time for embeds to properly resolve
        setTimeout(() => {
            let resEmbed = new EmbedBuilder()
                .setColor('#222224')
                .setTitle(gdoc.embeds[0].title)
                .setURL(link)
                .setDescription(gdoc.embeds[0].description)
                .setImage(attachment.url)

            gdoc.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

            resChan.send({
                embeds: [resEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

            interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
        }, 2000);
    }
};
