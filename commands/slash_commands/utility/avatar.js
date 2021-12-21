const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `avatar`,
    description: `Fetch a user's avatar and display it in an embed`,
    permission: ``,
    type: `CHAT_INPUT`,
    options: [{
        name: `username`,
        description: `The user whos avatar you want to fetch`,
        type: `USER`,
        required: false,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        const target = options.getMember(`username`) || member;

        const response = new MessageEmbed()
            .setColor('#32BEA6') // GREEN
            .setAuthor(`${target.user.tag}`, `${target.user.displayAvatarURL({ dynamic: true })}`)
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`)

        await interaction.reply({
            embeds: [response],
            ephemeral: true
        });
    }
}