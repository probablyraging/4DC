const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: `Channel Unmute`,
    description: ``,
    cooldown: 5,
    type: `MESSAGE`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, member, guild, channel } = interaction;

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = await fetchMsg.author;

        channel.permissionOverwrites.edit(target.id, {
            SEND_MESSAGES: null,
        }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

        // Log to channel
        let log = new MessageEmbed()
            .setColor("#4fe059")
            .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${target?.tag} *(${target?.id})*
**Action:** Channel Unmute
**Channel:** ${channel}`)
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

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