const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = requires('path');

module.exports = {
    name: `avatar`,
    description: `Fetch a user's avatar and display it in an embed`,
    permission: ``,
    type: `CHAT_INPUT`,
    usage: `/avatar (@username)`,
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