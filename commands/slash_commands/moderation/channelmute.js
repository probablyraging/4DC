const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const muteSchema = require('../../../schemas/misc/mute_schema');
const muteTimeoutSchema = require('../../../schemas/database_logs/mute_timeout_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


module.exports = {
    name: `channelmute`,
    description: `Mute a user in a specific channel`,
    access: 'staff',
    cooldown: 5,
    type: `CHAT_INPUT`,
    options: [{
        name: `add`,
        description: `Add a channel mute to a user`,
        type: `SUB_COMMAND`,
        usage: `/channelmute add [@username] [#channel] [reason]`,
        options: [{
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
        },
        {
            name: `duration`,
            description: `Set a duration (IN HOURS) for when the channel mute should expire`,
            type: `STRING`,
            required: false
        }],
    },
    {
        name: `remove`,
        description: `Remove a channel mute from a user`,
        type: `SUB_COMMAND`,
        usage: `/channelmute remove [@username] [#channel]`,
        options: [{
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
        }],
    }],

    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, member, guild, channel, options } = interaction;

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    const target = options.getMember('username');
                    const targetChan = options.getChannel('channel');
                    const reason = options.getString('reason');
                    let duration = options.getString('duration') || `0`;

                    if (reason && reason.length > 1024) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`Reasons are limited to 1024 characters\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    targetChan.permissionOverwrites.edit(target.id, {
                        SEND_MESSAGES: false,
                    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

                    if (duration > 0) {
                        const myDate = new Date();
                        const timestamp = myDate.setHours(myDate.getHours() + parseInt(duration));

                        await mongo().then(async mongoose => {
                            try {
                                await muteSchema.findOneAndUpdate({
                                    timestamp,
                                    userId: target.id,
                                    channelId: channel.id
                                }, {
                                    timestamp,
                                    userId: target.id,
                                    channelId: channel.id
                                }, {
                                    upsert: true
                                }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err) });
                            } finally {
                                // do nothing
                            }
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                    }

                    if (duration === '0') {
                        duration = 'Permanent';
                    } else {
                        duration = `${duration} hours`;
                    }

                    // Log to channel
                    let log = new MessageEmbed()
                        .setColor("#E04F5F")
                        .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}
**Duration:** ${duration}
**Reason:** ${reason}`)
                        .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/mute_icon.png' })
                        .setTimestamp();

                    logChan.send({
                        embeds: [log]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                    // Log to database for dashboard
                    const logTimestamp = new Date().getTime();

                    await mongo().then(async mongoose => {
                        await muteTimeoutSchema.create({
                            userId: target?.user.id,
                            username: target?.user.tag,
                            author: member?.id,
                            authorTag: `${member?.user.tag}`,
                            reason: reason,
                            timestamp: logTimestamp,
                            type: 'Channel Mute'
                        });
                    });

                    let dmFail = false;

                    target.send({
                        content: `${process.env.BOT_DENY} \`You have been muted in #${targetChan.name} on ${guild.name}\`
        
**Reason**
> ${reason}`
                    }).catch(() => dmFail = true).then(() => {
                        let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.user.tag} was muted in #${targetChan.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.user.tag} was muted in #${targetChan.name}\``;

                        interaction.reply({
                            content: `${replyMsg}`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    });
                }
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const target = options.getMember('username');
                    const targetChan = options.getChannel('channel');

                    targetChan.permissionOverwrites.edit(target.id, {
                        SEND_MESSAGES: null,
                    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

                    // Log to channel
                    let log = new MessageEmbed()
                        .setColor("#4fe059")
                        .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}`)
                        .setFooter({ text: `Channel Unmute • ${uuidv4()}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/unmute_icon.png' })
                        .setTimestamp();

                    logChan.send({
                        embeds: [log]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                    let dmFail = false;

                    target.send({
                        content: `${process.env.BOT_DENY} \`You have been unmuted in #${targetChan.name} on ${guild.name}\``
                    }).catch(() => dmFail = true).then(() => {
                        let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${target.user.tag} was unmuted in #${targetChan.name}\`\n${process.env.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`${target.user.tag} was unmuted in #${targetChan.name}\``;

                        interaction.reply({
                            content: `${replyMsg}`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    });
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}