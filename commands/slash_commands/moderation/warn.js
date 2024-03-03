const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, codeBlock } = require('discord.js');
const { dbCreate, dbDeleteOne, sendResponse } = require('../../../utils/utils');
const warnSchema = require('../../../schemas/warn_schema');
const { rules } = require('../../../lists/rules');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `warn`,
    description: `Add, remove or list a user's warnings`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 10,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `add`,
        description: `Add a warning to a specific user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `username`,
            description: `The user you want to add a warning to`,
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: `reason`,
            description: `Supply a reason for warning the user`,
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [{ name: 'Rule 1 - harmful posts, username, profile, etc..', value: '1' },
            { name: 'Rule 2 - advertising discord servers and paid services', value: '2' },
            { name: 'Rule 3 - breaking another platforms ToS, sub4sub, buying/sellin,g etc..', value: '3' },
            { name: 'Rule 4 - unsolicited DMs', value: '4' },
            { name: 'Rule 5 - self-promotion outside of content share section', value: '5' },
            { name: 'Rule 6 - sending repeated or purposeless message', value: '6' },
            { name: 'Rule 7 - messages not in English', value: '7' },
            { name: 'Custom - please provide a custom reason', value: 'custom' }]
        },
        {
            name: `custom`,
            description: `Provide a reason for warning the user when selecting custom`,
            type: ApplicationCommandOptionType.String,
            required: false
        }]
    },
    {
        name: `remove`,
        description: `Remove a warning from a specific user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `warning`,
            description: `The warning ID you want to remove`,
            type: ApplicationCommandOptionType.String,
            required: true
        }],
    },
    {
        name: `list`,
        description: `List warnings warning IDs for a specific user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `username`,
            description: `The user whos warnings you want to list`,
            type: ApplicationCommandOptionType.User,
            required: true
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        switch (options.getSubcommand()) {
            case 'add': {
                const guildId = guild.id;
                const target = options.getMember('username');
                const custom = options.getString('custom');
                const userId = target?.id;
                const username = target?.user.username;
                const authorTag = member.user.username;
                const warnId = uuidv4();
                const author = member.id;
                const timestamp = new Date().getTime();
                let reason = options.getString('reason');
                reason = (reason === 'custom') ? custom : rules[Number(reason) - 1];

                // If no reason was provided
                if (reason == null) return sendResponse(interaction, `You must provide custom reason when selecting the 'Custom' option`);
                // If the provided reason exceeds the character limit
                if (reason && reason.length > 1024) return sendResponse(interaction, `Reasons are limited to 1024 characters`);
                // If the target user cannot be found
                if (!userId || !username) return sendResponse(interaction, `The was an issue finding the user you are trying to warn`);

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#E04F5F")
                    .setAuthor({ name: `${authorTag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${username} *(${userId})* \n**Reason:** ${reason}`)
                    .setFooter({ text: `Warning Added • ${warnId}`, iconURL: process.env.LOG_WARN })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                // Log to database
                await dbCreate(warnSchema, { guildId, userId, username, warnId, author, authorTag, timestamp, reason });
                // Fetch warnings for the target user
                const results = await warnSchema.find({ guildId, userId });

                if (results.length >= 3) {
                    // Ban the user if this is their third warning
                    await target.ban({ days: 0, reason: `Warning threshold` })
                        .then(() => sendResponse(interaction, `Your warning was added`))
                        .catch(() => sendResponse(interaction, `This is ${target}'s third warning but I could not ban them`));
                } else {
                    // Notify the user that they received a warning
                    await target.send({ content: `${target} - you received a warning in ${guild.name} \n${codeBlock(reason)}` })
                        .then(() => sendResponse(interaction, `Your warning was added`))
                        .catch(() => sendResponse(interaction, `Your warning was added \nI could not send ${target} a notification`));
                }
                break;
            }

            case 'remove': {
                const warning = options.getString('warning');
                // Fetch warnings for the target user
                const results = (await warnSchema.find({ warnId: warning }))[0];
                // If no results were found
                if (!results) return sendResponse(interaction, `Warning *'${warning}'* does not exist or has already been deleted`);
                // Find and remove the user's warning
                await dbDeleteOne(warnSchema, { warnId: warning });
                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#4fe059")
                    .setAuthor({ name: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${results.username} *(${results.userId})*`)
                    .setFooter({ text: `Warning Removed • ${results.warnId}`, iconURL: process.env.LOG_UNWARN })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                // Send a follow up response
                sendResponse(interaction, `Warning '${warning}' removed`);
                break;
            }

            case 'list': {
                const target = options.getMember('username');
                // Fetch warnings for the target user
                const results = await warnSchema.find({ userId: target.id });
                // If no results were found
                if (results.length === 0) return sendResponse(interaction, `This user has no warnings`);
                // Create an embed to display the user's warnings
                let warningEmbed = new EmbedBuilder()
                    .setColor('#E04F5F')
                    .setAuthor({ name: `Warnings for ${target?.user.username}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()

                let warnCount = `0`;
                for (const warning of results) {
                    const { warnId, author, timestamp, reason } = warning
                    // Get the user who added the warning
                    const executor = guild.members.cache.get(author);
                    // Add the warning data to the embed
                    warningEmbed.addFields({
                        name: `#${warnCount}`,
                        value: `**Member:** ${target?.user.username} *(${target?.id})*
**Warned By:** ${executor.user.username} *(${executor.id})*
**Date:** <t:${Math.round(timestamp / 1000)}> (<t:${Math.round(timestamp / 1000)}:R>)
**Warning ID:** ${warnId}
**Reason:** ${reason}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, inline: false
                    });
                    // Increment the warning count
                    warnCount++
                }
                // Send a follow up response
                sendResponse(interaction, ``, [warningEmbed]);
                break;
            }
        }
    }
}