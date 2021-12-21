const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    // TODO : server wide mute and unmute - waiting to see what native timeout is first
    //      : Use plain message replies/notifications like used in warn.js
    name: `mute`,
    description: `Mute a specified user, server wide or in a single channel`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `channel`,
        description: `Mutes a specified user from a channel`,
        permission: `MANAGE_MESSAGES`,
        type: `SUB_COMMAND`,
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
            required: false
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, member, guild, channel, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'channel': {
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

                        const response2 = new MessageEmbed()
                            .setColor('#E04F5F')
                            .setAuthor(`${target.user.tag}`, `${target.user.displayAvatarURL({ dynamic: true })}`)
                            .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
                            .setDescription(`You have been muted in ${targetChan} on ${guild.name}

**Reason:**
\`\`\`${reason}\`\`\``)
                            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                            .setTimestamp()

                        mutesChan.send({
                            embeds: [response]
                        }).then(target.send({
                            embeds: [response2]
                        }).catch(() => interaction.reply({
                            content: `${process.env.BOT_DENY} \`I could not send ${target} a DM\``,
                            ephemeral: true
                        })));

                        interaction.reply({
                            content: `${process.env.BOT_CONF} ${target} has been muted in ${targetChan}`,
                            ephemeral: true
                        })
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

                        const response2 = new MessageEmbed()
                            .setColor('#32BEA6')
                            .setAuthor(`${target.user.tag}`, `${target.user.displayAvatarURL({ dynamic: true })}`)
                            .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
                            .setDescription(`You have been unmuted in ${targetChan} on ${guild.name}

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

                        await interaction.reply({
                            content: `${process.env.BOT_CONF} ${target} has been unmuted in ${targetChan}`,
                            ephemeral: true
                        })
                    }
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}