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

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = await fetchMsg.author;

        channel.permissionOverwrites.delete(target.id).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

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