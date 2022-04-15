const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const { deleteWarning, getWarnings, addWarning } = require('../../../modules/mods_choice/mods_choice_warning_data');
const { notifyUser } = require('../../../modules/notify/notify_utils');
const warnSchema = require('../../../schemas/misc/warn_schema');
const mcWarnSchema = require('../../../schemas/mods_choice/mods_choice_warn_schema');
const { rules } = require('../../../lists/rule-list');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');

module.exports = {
    name: `warn`,
    description: `Add, remove or list a user's warnings`,
    permission: `MODERATE_MEMBERS`,
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
            { name: 'modschoice', value: 'modschoice' }]
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

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    const type = options.getString('type');
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
                            content: `${process.env.BOT_DENY} \`You must provide custom reason when selecting the 'Custom' option\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    const warnChan = client.channels.cache.get(process.env.WARN_CHAN);

                    const guildId = guild.id;
                    const userId = target.id;
                    const authorTag = member.user.tag;
                    const warnId = uuidv4();
                    const author = member.id;
                    const timestamp = new Date().getTime();

                    if (type === 'regular') {
                        await mongo().then(async mongoose => {
                            try {
                                await warnSchema.findOneAndUpdate({
                                    guildId,
                                    userId,
                                    warnId,
                                    author,
                                    authorTag,
                                    timestamp,
                                    reason
                                }, {
                                    guildId,
                                    userId,
                                    warnId,
                                    author,
                                    authorTag,
                                    timestamp,
                                    reason
                                }, {
                                    upsert: true
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

                                        const log = new MessageEmbed()
                                            .setColor('#E04F5F')
                                            .setAuthor({ name: `${target?.user?.tag} has been warned`, iconURL: target?.displayAvatarURL({ dynamic: true }) })
                                            .addField(`Warned By`, `<@${member.id}>`, true)
                                            .addField(`Warning Count`, `${warnCount}`, true)
                                            .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                                            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                                            .setTimestamp()

                                        warnChan.send({
                                            embeds: [log]
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                                        interaction.reply({
                                            content: `${replyMsg}
    ${banMsg}`,
                                            ephemeral: true
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                    } else {
                                        let dmFail = false;

                                        target.send({
                                            content: `${process.env.BOT_DENY} \`You received a warning in ${guild.name}. You now have ${warnCount}/3 warnings!\`
                                                                                    
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

                                        const log = new MessageEmbed()
                                            .setColor('#E04F5F')
                                            .setAuthor({ name: `${target?.user?.tag} has been warned`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                                            .addField(`Warned By`, `<@${member.id}>`, true)
                                            .addField(`Warning Count`, `${warnCount}`, true)
                                            .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                                            .setFooter({ text: `${guild.name} • Warning ID ${warnId}`, iconURL: guild.iconURL({ dynamic: true }) })
                                            .setTimestamp()

                                        warnChan.send({
                                            embeds: [log]
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

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

                    if (type === 'modschoice') {
                        const warnedBy = user.id;

                        if (reason === 'lack_of_tabs') message = `The mods choice proof that you provided did not contain enough tabs.\nPlease ensure that you watch _all_ videos that are posted. You can use the \`/mcvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff`;
                        if (reason === 'has_not_posted_proof') message = `You have not posted to mods choice recently.\nPlease ensure that you post screenshots of the videos you watched _at least_ every 3 days. You can use the \`/mcvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff`;

                        await addWarning(userId, warnId, warnedBy, reason);

                        notifyUser(target, message, null);
                    }
                }
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const warnChan = client.channels.cache.get(process.env.WARN_CHAN);

                    const warning = options.getString('warning');

                    await mongo().then(async mongoose => {
                        const results = await warnSchema.find({ warnId: warning });

                        for (const data of results) {
                            var { userId } = data
                            gotUserId = userId
                        }

                        if (results.length >= 1) {
                            const log = new MessageEmbed()
                                .setColor('#32BEA6')
                                .setAuthor({ name: `${user.tag} deleted a regular warning`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                                .addField(`Removed From`, `<@${gotUserId}>`, true)
                                .addField(`Removed By`, `<@${user.id}>`, true)
                                .addField(`Warning Id`, `\`\`\`${warning}\`\`\``, false)
                                .setFooter({ text: `${guild.name} • Warning ID ${warning}`, iconURL: guild.iconURL({ dynamic: true }) })
                                .setTimestamp()

                            warnChan.send({
                                embeds: [log]
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                            await warnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

                        } else {
                            const results2 = await mcWarnSchema.find({ warnId: warning });

                            for (const data of results2) {
                                var { warnedBy } = data
                                gotUserId = warnedBy
                            }

                            if (results2.length >= 1) {
                                const log = new MessageEmbed()
                                    .setColor('#32BEA6')
                                    .setAuthor({ name: `${user.tag} deleted a mods choice warning`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                                    .addField(`Removed From`, `<@${gotUserId}>`, true)
                                    .addField(`Removed By`, `<@${user.id}>`, true)
                                    .addField(`Warning Id`, `\`\`\`${warning}\`\`\``, false)
                                    .setFooter({ text: `${guild.name} • Warning ID ${warning}`, iconURL: guild.iconURL({ dynamic: true }) })
                                    .setTimestamp()

                                warnChan.send({
                                    embeds: [log]
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                                await mcWarnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                    content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));

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

                        // mods choice warnings
                        const results2 = await mcWarnSchema.find({ userId });

                        let mcWarningEmbed = new MessageEmbed()
                            .setColor('#bdeb34')
                            .setAuthor({ name: `Mods Choice Warnings for ${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
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