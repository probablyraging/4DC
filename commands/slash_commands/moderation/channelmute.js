const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const muteSchema = require('../../../schemas/misc/mute_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


module.exports = {
    name: `channelmute`,
    description: `Mute a user in a specific channel`,
    defaultMemberPermissions: ['BanMembers'],
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `add`,
        description: `Add a channel mute to a user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `username`,
            description: `The user you want to mute`,
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: `channel`,
            description: `The channel you want to mute the user in`,
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: `reason`,
            description: `The reason for muting the user`,
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: `duration`,
            description: `Set a duration (IN HOURS) for when the channel mute should expire`,
            type: ApplicationCommandOptionType.String,
            required: false
        }],
    },
    {
        name: `remove`,
        description: `Remove a channel mute from a user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `username`,
            description: `The user you want to mute`,
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: `channel`,
            description: `The channel you want to mute the user in`,
            type: ApplicationCommandOptionType.Channel,
            required: true
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, channel, options } = interaction;

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        switch (options.getSubcommand()) {
            case 'add': {
                const target = options.getMember('username');
                const targetChan = options.getChannel('channel');
                const reason = options.getString('reason');
                let duration = options.getString('duration') || `0`;

                if (reason && reason.length > 1024) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} Reasons are limited to 1024 characters`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                targetChan.permissionOverwrites.edit(target.id, {
                    SendMessages: false,
                }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

                if (duration > 0) {
                    const myDate = new Date();
                    const timestamp = myDate.setHours(myDate.getHours() + parseInt(duration));

                    await muteSchema.updateOne({
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
                }

                if (!duration || duration === '0') {
                    duration = 'Permanent';
                } else {
                    if (duration > 1) {
                        duration = `${duration} hours`;
                    } else {
                        duration = `${duration} hour`;
                    }
                }

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#E04F5F")
                    .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}
**Duration:** ${duration}
**Reason:** ${reason}`)
                    .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: 'https://i.imgur.com/LOAhPjU.png' })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                interaction.reply({
                    content: `${process.env.BOT_CONF} ${target} was muted in ${targetChan}`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            case 'remove': {
                const target = options.getMember('username');
                const targetChan = options.getChannel('channel');

                targetChan.permissionOverwrites.edit(target.id, {
                    SendMessages: null,
                }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#4fe059")
                    .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}`)
                    .setFooter({ text: `Channel Unmute • ${uuidv4()}`, iconURL: 'https://i.imgur.com/bCghXGD.png' })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                interaction.reply({
                    content: `${process.env.BOT_CONF} ${target} was unmuted in ${targetChan}`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }
        }
    }
}