const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const { deleteWarning, getWarnings, addWarning } = require('../../../modules/creator_crew/utilities');
const { notifyUser } = require('../../../modules/creator_crew/utilities');
const warnSchema = require('../../../schemas/misc/warn_schema');
const ccWarnModel = require('../../../schemas/creator_crew/warn_schema');
const { getRules } = require('../../../lists/rule-list');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');

module.exports = {
    name: `warn`,
    description: `Add, remove or list a user's warnings`,
    access: 'staff',
    cooldown: 10,
    type: `CHAT_INPUT`,
    options: [{
        name: `add`,
        description: `Add a warning to a specific user`,
        type: `SUB_COMMAND`,
        usage: `/warn add [type] [@username] [reason]`,
        options: [{
            name: `type`,
            description: `The type of warning to add`,
            type: `STRING`,
            required: true,
            choices: [{ name: 'regular', value: 'regular' },
            { name: 'creatorcrew', value: 'creatorcrew' }]
        },
        {
            name: `username`,
            description: `The user you want to add a warning to`,
            type: `USER`,
            required: true
        },
        {
            name: `reason`,
            description: `Supply a reason for warning the user`,
            type: `STRING`,
            required: true,
            choices: [{ name: 'Rule 1 - harmful post/username/profile etc..', value: '1' },
            { name: 'Rule 2 - spamming and flooding', value: '2' },
            { name: 'Rule 3 - self promotion and unsolicited DMs', value: '3' },
            { name: 'Rule 4 - advertising discord servers and paid services', value: '4' },
            { name: 'Rule 5 - sub4sub type behaviour', value: '5' },
            { name: 'Rule 6 - openly discussing moderator actions', value: '6' },
            { name: 'Rule 7 - messages not in English', value: '7' },
            { name: 'Custom', value: 'Custom' },
            { name: 'Lack of tabs in screenshot', value: 'lack_of_tabs' },
            { name: 'Has not posted proof', value: 'has_not_posted_proof' }]
        },
        {
            name: `custom`,
            description: `Supply a reason for warning the user when selecting custom`,
            type: `STRING`,
            required: false
        }]
    },
    {
        name: `remove`,
        description: `Remove a warning from a specific user`,
        type: `SUB_COMMAND`,
        usage: `/warn remove [warningId]`,
        options: [{
            name: `warning`,
            description: `The warning ID you want to remove`,
            type: `STRING`,
            required: true
        }],
    },
    {
        name: `list`,
        description: `List warnings warning IDs for a specific user`,
        type: `SUB_COMMAND`,
        usage: `/warn list [@username]`,
        options: [{
            name: `username`,
            description: `The user whos warnings you want to list`,
            type: `USER`,
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

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    const type = options.getString('type');
                    const target = options.getMember('username');
                    let reason = options.getString('reason');
                    const custom = options.getString('custom');

                    await getRules().then(async rule => {
                        if (reason === '1') reason = `${rule[0]}`;
                        if (reason === '2') reason = `${rule[1]}`;
                        if (reason === '3') reason = `${rule[2]}`;
                        if (reason === '4') reason = `${rule[3].replace('<#${process.env.PREM_CHAN}>', `<#${process.env.PREM_CHAN}>`)}`;
                        if (reason === '5') reason = `${rule[4]}`;
                        if (reason === '6') reason = `${rule[5]}`;
                        if (reason === '7') reason = `${rule[6]}`;
                        if (reason === 'Custom') reason = `${custom}`;
                    });

                    if (reason === 'null') {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`You must provide custom reason when selecting the 'Custom' option\``,
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

                    if (type === 'regular') {
                        // Log to channel
                        let log = new MessageEmbed()
                            .setColor("#E04F5F")
                            .setAuthor({ name: `${authorTag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`**Member:** ${username} *(${userId})*
**Reason:** ${reason}`)
                            .setFooter({ text: `Warning Added • ${warnId}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/warning_add_icon.png' })
                            .setTimestamp();

                        logChan.send({
                            embeds: [log]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                        // Log to database
                        await mongo().then(async mongoose => {
                            try {
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
                            } finally {
                                // do nothing
                            }

                            await mongo().then(async (mongoose) => {
                                try {
                                    const results = await warnSchema.find({ guildId, userId });
                                    const warnCount = results.length;

                                    if (warnCount >= 3) {
                                        let dmFail = false;
                                        let banFail = false;

                                        target.send({
                                            content: `${process.env.BOT_DENY} \`You have been permanently banned from ${guild.name}\`
                                                                                    
**Reason**
> Warning threshold reached`
                                        }).catch(() => dmFail = true);

                                        let replyMsg = dmFail ? `${process.env.BOT_DENY} \`Your warning was added\`\n${process.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`Your warning was added\``;

                                        target.ban({
                                            days: 0,
                                            reason: `Warning threshold reached`
                                        }).catch(() => banFail = true);

                                        let banMsg = banFail ? `${process.env.BOT_DENY} \`I could not ban ${target.user.tag}\`` : `${process.env.BOT_CONF} \`${target.user.tag} was banned\``;

                                        if (reason && reason.length > 1024) {
                                            return interaction.reply({
                                                content: `${process.env.BOT_DENY} \`Reasons are limited to 1024 characters\``,
                                                ephemeral: true
                                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                        }

                                        interaction.reply({
                                            content: `${replyMsg}
${banMsg}`,
                                            ephemeral: true
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                    } else {
                                        let dmFail = false;

                                        target.send({
                                            content: `${target} - you received a warning in ${guild.name}. You now have ${warnCount}/3 warnings!
                                                                                    
**Reason**
> ${reason}`
                                        }).catch(() => dmFail = true);

                                        let replyMsg = dmFail ? `${process.env.BOT_DENY} \`Your warning was added\`\n${process.BOT_DENY} \`I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`Your warning was added\``;

                                        if (reason && reason.length > 1024) {
                                            return interaction.reply({
                                                content: `${process.env.BOT_DENY} \`Reasons are limited to 1024 characters\``,
                                                ephemeral: true
                                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                        }

                                        interaction.reply({
                                            content: `${replyMsg}`,
                                            ephemeral: true
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                    }
                                } finally {
                                    // do nothing
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                    }

                    if (type === 'creatorcrew') {
                        const warnedBy = user.id;

                        if (reason === 'lack_of_tabs') message = `The Creator Crew proof that you provided did not contain enough tabs.\nPlease ensure that you watch _all_ videos that are posted. You can use the \`/ccvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff`;
                        if (reason === 'has_not_posted_proof') message = `You have not posted to Creator Crew recently.\nPlease ensure that you post screenshots of the videos you watched _at least_ every 3 days. You can use the \`/ccvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff`;

                        await addWarning(userId, warnId, warnedBy, reason);

                        notifyUser(target, message, null);
                    }
                }
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const warning = options.getString('warning');

                    await mongo().then(async mongoose => {
                        const results = await warnSchema.find({ warnId: warning });

                        if (results.length >= 1) {
                            await warnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

                            for (const data of results) {
                                const { author, authorTag, username, userId, warnId } = data;

                                const authorAvatar = guild.members.cache.get(author);

                                // Log to channel
                                let log = new MessageEmbed()
                                    .setColor("#4fe059")
                                    .setAuthor({ name: `${authorTag}`, iconURL: authorAvatar?.user.displayAvatarURL({ dynamic: true }) })
                                    .setDescription(`**Member:** ${username} *(${userId})*`)
                                    .setFooter({ text: `Warning Removed • ${warnId}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/warning_remove_icon.png' })
                                    .setTimestamp();

                                logChan.send({
                                    embeds: [log]
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                            }

                        } else {
                            const results2 = await ccWarnModel.find({ warnId: warning });

                            if (results2.length >= 1) {
                                await ccWarnModel.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                    content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

                                for (const data of results2) {
                                    const { author, authorTag, username, userId, warnId } = data;

                                    const authorAvatar = guild.members.cache.get(author);

                                    // Log to channel
                                    let log = new MessageEmbed()
                                        .setColor("#4fe059")
                                        .setAuthor({ name: `${authorTag}`, iconURL: authorAvatar?.user.displayAvatarURL({ dynamic: true }) })
                                        .setDescription(`**Member:** ${username} *(${userId})*`)
                                        .setFooter({ text: `Warning Removed • ${warnId}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/warning_remove_icon.png' })
                                        .setTimestamp();

                                    logChan.send({
                                        embeds: [log]
                                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                                }

                            } else {
                                interaction.reply({
                                    content: `${process.env.BOT_DENY} \`Warning '${warning}' does not exist or has already been deleted\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'list': {
                    const target = options.getMember('username');

                    const guildId = guild.id;
                    const userId = target.id;

                    let regWarning = 0;
                    let mcWarning = 0;

                    await mongo().then(async (mongoose) => {
                        // regular warnings
                        const results = await warnSchema.find({ guildId, userId });

                        let warningEmbed = new MessageEmbed()
                            .setColor('#32BEA6')
                            .setAuthor({ name: `Regular Warnings for ${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                            .setTimestamp()

                        if (results.length >= 1) {
                            regWarning++;
                            warnCount = `0`;

                            for (const warning of results) {
                                const { warnId, author, timestamp, reason } = warning
                                warnCount++

                                warningEmbed.addField(`#${warnCount}
⠀
Warning ID`, `\`\`\`${warnId}\`\`\``, false)
                                warningEmbed.addField(`Date`, `\`\`\`${moment(timestamp).format('llll')}\`\`\``, false)
                                warningEmbed.addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                                warningEmbed.addField(`Warned By`, `<@${author}>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, false)
                            }
                        }

                        // creator crew warnings
                        const results2 = await ccWarnModel.find({ userId });

                        let mcWarningEmbed = new MessageEmbed()
                            .setColor('#bdeb34')
                            .setAuthor({ name: `Creator Crew Warnings for ${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                            .setTimestamp()

                        if (results2.length >= 1) {
                            mcWarning++;
                            warnCount = `0`;

                            for (const warning of results2) {
                                const { warnId, warnedBy, timestamp, reason } = warning
                                warnCount++

                                mcWarningEmbed.addField(`#${warnCount}
⠀
Warning ID`, `\`\`\`${warnId}\`\`\``, false)
                                mcWarningEmbed.addField(`Date`, `\`\`\`${moment(timestamp).format('llll')}\`\`\``, false)
                                mcWarningEmbed.addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                                mcWarningEmbed.addField(`Warned By`, `<@${warnedBy}>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, false)
                            }
                        }

                        if (regWarning >= 1 && mcWarning >= 1) {
                            interaction.reply({
                                embeds: [warningEmbed, mcWarningEmbed],
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        } else if (regWarning >= 1) {
                            interaction.reply({
                                embeds: [warningEmbed],
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        } else if (mcWarning >= 1) {
                            interaction.reply({
                                embeds: [mcWarningEmbed],
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        } else {
                            interaction.reply({
                                content: 'This user has no warnings',
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}