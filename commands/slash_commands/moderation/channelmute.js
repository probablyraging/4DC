const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { dbUpdateOne, dbDeleteOne, sendResponse } = require('../../../utils/utils');
const muteSchema = require('../../../schemas/misc/mute_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


module.exports = {
    name: `channelmute`,
    description: `Mute a user in a specific channel`,
    defaultMemberPermissions: ['ModerateMembers'],
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

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        switch (options.getSubcommand()) {
            case 'add': {
                const target = options.getMember('username');
                const targetChan = options.getChannel('channel');
                const reason = options.getString('reason');
                let duration = options.getString('duration') || `0`;

                // If the reason exceeds the character limit
                if (reason && reason.length > 1024) return sendResponse(interaction, `${process.env.BOT_DENY} Reasons are limited to 1024 characters`);
                // Update the channel permissions for the target user
                targetChan.permissionOverwrites.edit(target.id, {
                    SendMessages: false,
                }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
                // If a duration was provided, get a timestamp for when the mute should expire and update the database
                const myDate = new Date();
                const timestamp = !duration || duration === '0' ? 'null' : myDate.getTime() + (duration * 60 * 60 * 1000);
                await dbUpdateOne(muteSchema, { userId: target.id, channelId: targetChan.id }, { userId: target.id, channelId: targetChan.id, timestamp: timestamp });

                duration = !duration || duration === '0' ? 'Permanent' : `${duration} ${duration > 1 ? 'hours' : 'hour'}`;

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#E04F5F")
                    .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}
**Duration:** ${duration}
**Reason:** ${reason}`)
                    .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: process.env.LOG_MUTE })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} ${target} was muted in ${targetChan}`);
                break;
            }

            case 'remove': {
                const target = options.getMember('username');
                const targetChan = options.getChannel('channel');

                // Update the channel permissions for the target user
                targetChan.permissionOverwrites.delete(target.id).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
                await dbDeleteOne(muteSchema, { userId: target?.id, channelId: targetChan.id });

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#4fe059")
                    .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${target?.user.tag} *(${target?.user.id})*
**Channel:** ${targetChan}`)
                    .setFooter({ text: `Channel Unmute • ${uuidv4()}`, iconURL: process.env.LOG_UNMUTE })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} ${target} was unmuted in ${targetChan}`);
                break;
            }
        }
    }
}