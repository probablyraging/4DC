const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `channelmute`,
    description: ``,
    permission: `MANAGE_MESSAGES`,
    type: `MESSAGE`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, member, guild, channel } = interaction;

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = await fetchMsg.author;
        const mutesChan = client.channels.cache.find(channel => channel.id === process.env.MUTES_CHAN);
        const reason = null;

        channel.permissionOverwrites.edit(target, {
            SEND_MESSAGES: false,
        });

        const response = new MessageEmbed()
            .setColor('#E04F5F')
            .setAuthor(`${target.tag} has been muted`, `${target.displayAvatarURL({ dynamic: true })}`)
            .addField(`Channel:`, `${channel}`, true)
            .addField(`By:`, `<@${member.id}>`, false)
            .addField(`Reason:`, `\`\`\`${reason}\`\`\``, false)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        const response2 = new MessageEmbed()
            .setColor('#E04F5F')
            .setAuthor(`${target.tag}`, `${target.displayAvatarURL({ dynamic: true })}`)
            .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
            .setDescription(`You have been muted in ${channel} on ${guild.name}

**Reason:**
\`\`\`${reason}\`\`\``)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        mutesChan.send({
            embeds: [response]
        }).then(target.send({
            embeds: [response2]
        }).catch(() => channel.send({
            content: `${process.env.BOT_DENY} \`I could not send ${target} a DM\``,
            ephemeral: true
        })));

        interaction.reply({
            content: `${process.env.BOT_CONF} ${target} has been muted in ${channel}`,
            ephemeral: true
        })
    }
}