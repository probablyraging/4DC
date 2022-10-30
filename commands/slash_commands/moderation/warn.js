const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const warnSchema = require('../../../schemas/misc/warn_schema');
const { rules } = require('../../../lists/rules');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `warn`,
    description: `Add, remove or list a user's warnings`,
    cooldown: 10,
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
            choices: [{ name: 'Rule 1 - harmful post/username/profile etc..', value: '1' },
            { name: 'Rule 2 - spamming and flooding', value: '2' },
            { name: 'Rule 3 - self promotion and unsolicited DMs', value: '3' },
            { name: 'Rule 4 - advertising discord servers and paid services', value: '4' },
            { name: 'Rule 5 - behaviour breaking platform ToS', value: '5' },
            { name: 'Rule 6 - openly discussing moderator actions', value: '6' },
            { name: 'Rule 7 - messages not in English', value: '7' },
            { name: 'Custom', value: 'Custom' },
            { name: 'Lack of tabs in screenshot', value: 'lack_of_tabs' },
            { name: 'Has not posted proof', value: 'has_not_posted_proof' }]
        },
        {
            name: `custom`,
            description: `Supply a reason for warning the user when selecting custom`,
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
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, member, guild, user, options } = interaction;
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        switch (options.getSubcommand()) {
            case 'add': {
                const target = options.getMember('username');
                let reason = options.getString('reason');
                const custom = options.getString('custom');

                if (reason === '1') reason = `${rules[0]}`;
                if (reason === '2') reason = `${rules[1]}`;
                if (reason === '3') reason = `${rules[2]}`;
                if (reason === '4') reason = `${rules[3]}`;
                if (reason === '5') reason = `${rules[4]}`;
                if (reason === '6') reason = `${rules[5]}`;
                if (reason === '7') reason = `${rules[6]}`;
                if (reason === 'Custom') reason = `${custom}`;

                if (reason === 'null') {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} You must provide custom reason when selecting the 'Custom' option`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                const guildId = guild.id;
                const userId = target.id;
                const username = target.user.tag;
                const authorTag = member.user.tag;
                const warnId = uuidv4();
                const author = member.id;
                const timestamp = new Date().getTime();

                // Log to channel
                let log = new EmbedBuilder()
                    .setColor("#E04F5F")
                    .setAuthor({ name: `${authorTag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${username} *(${userId})*
**Reason:** ${reason}`)
                    .setFooter({ text: `Warning Added • ${warnId}`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/warning_add_icon.png' })
                    .setTimestamp();

                logChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                // Log to database
                await warnSchema.create({
                    guildId,
                    userId,
                    username,
                    warnId,
                    author,
                    authorTag,
                    timestamp,
                    reason
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                const results = await warnSchema.find({ guildId, userId });
                const warnCount = results.length;

                if (warnCount >= 3) {
                    let banFail = false;

                    target.ban({
                        days: 0,
                        reason: `Warning threshold reached`
                    }).catch(() => banFail = true);

                    let banMsg = banFail ? `${process.env.BOT_DENY} I could not ban ${target}` : `${process.env.BOT_CONF} ${target} was banned`;

                    if (reason && reason.length > 1024) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} Reasons are limited to 1024 characters`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    interaction.reply({
                        content: `${process.env.BOT_CONF} Your warning was added
${banMsg}`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                } else {
                    let dmFail = false;

                    await target.send({
                        content: `${target} - you received a warning in ${guild.name}
\`\`\`${reason}\`\`\``
                    }).catch(() => dmFail = true);

                    let replyMsg = dmFail ? `${process.env.BOT_CONF} Your warning was added\n${process.env.BOT_DENY} I could not send ${target} a notification` : `${process.env.BOT_CONF} Your warning was added`;

                    if (reason && reason.length > 1024) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} Reasons are limited to 1024 characters`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    interaction.reply({
                        content: `${replyMsg}`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                break;
            }

            case 'remove': {
                const warning = options.getString('warning');

                const results = await warnSchema.find({ warnId: warning });

                if (results.length >= 1) {
                    await warnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                        content: `${process.env.BOT_CONF} Warning '${warning}' removed`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

                    for (const data of results) {
                        const { author, authorTag, username, userId, warnId } = data;

                        const authorAvatar = guild.members.cache.get(author);

                        // Log to channel
                        let log = new EmbedBuilder()
                            .setColor("#4fe059")
                            .setAuthor({ name: `${authorTag}`, iconURL: authorAvatar?.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`**Member:** ${username} *(${userId})*`)
                            .setFooter({ text: `Warning Removed • ${warnId}`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/warning_remove_icon.png' })
                            .setTimestamp();

                        logChan.send({
                            embeds: [log]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                    }

                } else {
                    const results2 = await ccWarnModel.find({ warnId: warning });

                    if (results2.length >= 1) {
                        await ccWarnModel.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                            content: `${process.env.BOT_CONF} Warning '${warning}' removed`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

                        for (const data of results2) {
                            const { author, authorTag, username, userId, warnId } = data;

                            const authorAvatar = guild.members.cache.get(author);

                            // Log to channel
                            let log = new EmbedBuilder()
                                .setColor("#4fe059")
                                .setAuthor({ name: `${authorTag}`, iconURL: authorAvatar?.user.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`**Member:** ${username} *(${userId})*`)
                                .setFooter({ text: `Warning Removed • ${warnId}`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/warning_remove_icon.png' })
                                .setTimestamp();

                            logChan.send({
                                embeds: [log]
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                        }

                    } else {
                        interaction.reply({
                            content: `${process.env.BOT_DENY} Warning '${warning}' does not exist or has already been deleted`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }

                break;
            }

            case 'list': {
                const target = options.getMember('username');
                const guildId = guild.id;
                const userId = target.id;

                // regular warnings
                const results = await warnSchema.find({ guildId, userId });

                let warningEmbed = new EmbedBuilder()
                    .setColor('#E04F5F')
                    .setAuthor({ name: `Warnings for ${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                    .setFooter({ text: `Warning`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/warning_remove_icon.png' })
                    .setTimestamp()

                if (results.length > 0) {
                    warnCount = `0`;

                    for (const warning of results) {
                        const { warnId, author, timestamp, reason } = warning
                        warnCount++

                        const executor = guild.members.cache.get(author);

                        warningEmbed.addFields({
                            name: `#${warnCount}`,
                            value: `**Member:** ${target?.user.tag} *(${target?.id})*
**Warned By:** ${executor.user.tag} *(${executor.id})*
**Date:** <t:${Math.round(timestamp / 1000)}> (<t:${Math.round(timestamp / 1000)}:R>)
**Warning ID:** ${warnId}
**Reason:** ${reason}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, inline: false
                        });
                    }

                    interaction.reply({
                        embeds: [warningEmbed],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                } else {
                    interaction.reply({
                        content: 'This user has no warnings',
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
                break;
            }
        }
    }
}