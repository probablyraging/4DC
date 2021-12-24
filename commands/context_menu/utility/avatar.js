const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `Avatar`,
    description: ``,
    permission: ``,
    type: `USER`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const target = await interaction.guild.members.fetch(interaction.targetId).catch(() => {
            interaction.reply({
                content: `${process.env.BOT_DENY} \`This user no longer exists\``,
                ephemeral: true
            });
        });;

        const response = new MessageEmbed()
            .setColor('#32BEA6')
            .setAuthor(`${target.user.tag}`, `${target.user.displayAvatarURL({ dynamic: true })}`)
            .setTitle(`AVATAR`)
            .setImage(`${target.user.displayAvatarURL({ dynamic: true })}?size=256`)

        interaction.reply({
            embeds: [response],
            ephemeral: true
        });
    }
}