const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `Channel Unmute`,
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
        const mutesChan = client.channels.cache.get(process.env.MUTES_CHAN);
        const reason = `None - command ran via context menu`;

        channel.permissionOverwrites.delete(target).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

        const log = new MessageEmbed()
            .setColor('#32BEA6')
            .setAuthor(`${target.tag} has been unmuted`, `${target.displayAvatarURL({ dynamic: true })}`)
            .addField(`Channel:`, `${channel}`, true)
            .addField(`By:`, `<@${member.id}>`, false)
            .addField(`Reason:`, `\`\`\`${reason}\`\`\``, false)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        mutesChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

        let dmFail = false;

        target.send({
            content: `${process.env.BOT_DENY} \`You have been unmuted in #${channel.name} on ${guild.name}\`
                                                                                    
**Reason**
> None`
        }).catch(() => dmFail = true).then(() => {
            let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.tag} was unmuted in #${channel.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.tag} was unmuted in #${channel.name}\``;

            interaction.reply({
                content: `${replyMsg}`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        });
    }
}