const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `avatar`,
    description: `Fetch a user's avatar and display it in an embed`,
    access: '',
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    usage: `/avatar (@username)`,
    options: [{
        name: `username`,
        description: `The user whos avatar you want to fetch`,
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        const target = options.getMember(`username`) || member;

        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setAuthor({ name: `${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`)

        interaction.reply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}