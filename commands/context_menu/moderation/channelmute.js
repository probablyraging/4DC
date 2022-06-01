const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const muteTimeoutSchema = require('../../../schemas/database_logs/mute_timeout_schema');
const path = require('path');

module.exports = {
    name: `Channel Mute`,
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
        const target = fetchMsg.author;
        const reason = `None - command ran via context menu`;

        channel.permissionOverwrites.edit(target.id, {
            SEND_MESSAGES: false,
        }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

        // Log to database for dashboard
        const logTimestamp = new Date().getTime();

        await mongo().then(async mongoose => {
            await muteTimeoutSchema.create({
                userId: target?.id,
                username: target?.tag,
                author: member?.id,
                authorTag: `${member?.user.tag}`,
                reason: reason,
                timestamp: logTimestamp,
                type: 'Channel Mute'
            });
        });

        let dmFail = false;

        target.send({
            content: `${process.env.BOT_DENY} \`You have been muted in #${channel.name} on ${guild.name}\`
                                                                                
**Reason**
> None`
        }).catch(() => dmFail = true).then(() => {
            let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.tag} was muted in #${channel.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.tag} was muted in #${channel.name}\``;

            interaction.reply({
                content: `${replyMsg}`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        });
    }
}