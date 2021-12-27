const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: `livenow`,
    description: `Shows a list of all server members who are currently streaming`,
    permission: `MANAGE_MESSAGES`,
    cooldown: 3600,
    type: `CHAT_INPUT`,
    usage: `/livenow`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild } = interaction;

        const liveRole = guild.roles.cache.get(process.env.LIVE_ROLE)
        const liveSize = guild.members.cache.filter(member => member.roles.cache.find(role => role === liveRole)).size
        const liveMember = guild.members.cache.filter(member => member.roles.cache.find(role => role === liveRole)).map(member => member.user.id);

        let response = new MessageEmbed()
            .setColor('#fff500')
            .setTitle(`${process.env.LIVE_NOW} Live Now | SHOW SUPPORT`)

        if (liveSize < 1) {
            response.setDescription(`There are currently **${liveSize}** members streaming`)
        } else {
            response.setDescription(`There are currently **${liveSize}** members streaming`)
            response.addField(` `, `<@${liveMember.join('>\n<@')}>`, false)
        }

        interaction.reply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}