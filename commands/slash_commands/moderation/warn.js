const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const warnSchema = require('../../../schemas/warn-schema');
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
        usage: `/warn add [@username] [reason]`,
        options: [{
            name: `username`,
            description: `The user you want to add a warning to`,
            type: `USER`,
            required: true
        },
        {
            name: `reason`,
            description: `Supply a reason for warning the user`,
            type: `STRING`,
            required: true
        }],
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
                    const target = options.getMember('username');
                    const reason = options.getString('reason');

                    const warnChan = client.channels.cache.get(process.env.WARN_CHAN);

                    const guildId = guild.id;
                    const userId = target.id;
                    const authorTag = member.user.tag;
                    const warnId = uuidv4();
                    const author = member.id;
                    const timestamp = new Date().getTime();

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
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const warnChan = client.channels.cache.get(process.env.WARN_CHAN);

                    const warning = options.getString('warning');

                    await mongo().then(async mongoose => {
                        try {
                            const results = await warnSchema.find({ warnId: warning })
                            for (const data of results) {
                                var { userId } = data
                                gotUserId = userId
                            }

                            if (results.length > 0) {

                                const log = new MessageEmbed()
                                    .setColor('#32BEA6')
                                    .setAuthor({ name: `${user.tag} deleted a warning`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                                    .addField(`Removed From`, `<@${gotUserId}>`, true)
                                    .addField(`Removed By`, `<@${user.id}>`, true)
                                    .addField(`Warning Id`, `\`\`\`${warning}\`\`\``, false)
                                    .setFooter({ text: `${guild.name} • Warning ID ${warnId}`, iconURL: guild.iconURL({ dynamic: true }) })
                                    .setTimestamp()

                                warnChan.send({
                                    embeds: [log]
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                                await warnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                    content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)));
                            } else {
                                interaction.reply({
                                    content: `${process.env.BOT_DENY} \`Warning '${warning}' does not exist or has already been deleted\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        } finally {
                            // do nothing
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'list': {
                    const target = options.getMember('username');

                    const guildId = guild.id;
                    const userId = target.id;

                    await mongo().then(async (mongoose) => {
                        try {
                            const results = await warnSchema.find({ guildId, userId });

                            let warningEmbed = new MessageEmbed()
                                .setColor('#32BEA6')
                                .setAuthor({ name: `Warnings for ${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
                                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                                .setTimestamp()

                            if (results.length < 1) {
                                warningEmbed.setDescription(`The user has no warnings`)
                            } else {

                                warnCount = `0`
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

                            interaction.reply({
                                embeds: [warningEmbed],
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        } finally {
                            // do bothing
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}