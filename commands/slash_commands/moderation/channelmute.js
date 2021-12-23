const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `channelmute`,
    description: `Mute a user in a specific channel`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `choice`,
        description: `Whether you want to mute or unmute the user`,
        type: `STRING`,
        required: true,
        choices: [{
            name: `add`,
            value: `add`
        },
        {
            name: `remove`,
            value: `remove`
        }],
    },
    {
        name: `username`,
        description: `The user you want to mute`,
        type: `USER`,
        required: true
    },
    {
        name: `channel`,
        description: `The channel you want to mute the user in`,
        type: `CHANNEL`,
        required: true
    },
    {
        name: `reason`,
        description: `The reason for muting the user`,
        type: `STRING`,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { client, member, guild, channel, options } = interaction;


        const choice = options.getString('choice');
        const target = options.getMember('username');
        const targetChan = options.getChannel('channel');
        const reason = options.getString('reason');

        const mutesChan = client.channels.cache.get(process.env.MUTES_CHAN);

        if (choice === 'add') {
            targetChan.permissionOverwrites.edit(target.id, {
                SEND_MESSAGES: false,
            });

            const response = new MessageEmbed()
                .setColor('#E04F5F')
                .setAuthor(`${target.user.tag} has been muted`, `${target.user.displayAvatarURL({ dynamic: true })}`)
                .addField(`Channel:`, `${targetChan}`, true)
                .addField(`By:`, `<@${member.id}>`, false)
                .addField(`Reason:`, `\`\`\`${reason}\`\`\``, false)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            mutesChan.send({
                embeds: [response]
            });

            let dmFail = false;

            target.send({
                content: `${process.env.BOT_DENY} \`You have been muted in #${channel.name} on ${guild.name}\`

**Reason**
> ${reason}`
            }).catch(() => dmFail = true).then(() => {
                let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.user.tag} was muted in #${channel.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.user.tag} was muted in #${channel.name}\``;

                interaction.reply({
                    content: `${replyMsg}`,
                    ephemeral: true
                });
            });
        }

        if (choice === 'remove') {
            targetChan.permissionOverwrites.delete(target.id);

            const response = new MessageEmbed()
                .setColor('#32BEA6')
                .setAuthor(`${target.user.tag} has been unmuted`, `${target.user.displayAvatarURL({ dynamic: true })}`)
                .addField(`Channel:`, `${targetChan}`, true)
                .addField(`By:`, `<@${member.id}>`, false)
                .addField(`Reason:`, `\`\`\`${reason}\`\`\``, false)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            mutesChan.send({
                embeds: [response]
            });

            let dmFail = false;

            target.send({
                content: `${process.env.BOT_DENY} \`You have been unmuted in #${channel.name} on ${guild.name}\`

**Reason**
> ${reason}`
            }).catch(() => dmFail = true).then(() => {
                let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.user.tag} was unmuted in #${channel.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.user.tag} was unmuted in #${channel.name}\``;

                interaction.reply({
                    content: `${replyMsg}`,
                    ephemeral: true
                });
            });
        }
    }
}