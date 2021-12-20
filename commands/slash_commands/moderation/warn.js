const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const warnSchema = require('../../../schemas/warn-schema')
const makeId = require('../../../modules/makeId');
const moment = require('moment');

module.exports = {
    name: `warn`,
    description: `Add, remove or list a user's warnings`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `add`,
        description: `Add a warning to a specified user`,
        permission: `MANAGE_MESSAGES`,
        type: `SUB_COMMAND`,
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
        description: `Remove a warning from a specified user`,
        permission: `MANAGE_MESSAGES`,
        type: `SUB_COMMAND`,
        options: [{
            name: `warning`,
            description: `The warning ID you want to remove`,
            type: `STRING`,
            required: true
        }],
    },
    {
        name: `list`,
        description: `List warnings for a specified user`,
        permission: `MANAGE_MESSAGES`,
        type: `SUB_COMMAND`,
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
        const { client, member, guild, channel, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    const target = options.getMember('username');
                    const reason = options.getString('reason');

                    const guildId = guild.id;
                    const userId = target.id;
                    const authorTag = member.user.tag;
                    const warnId = makeId();
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
                            }).catch(err => { return; });
                        } finally {
                            mongoose.connection.close().catch(() => { return });
                        }

                        await mongo().then(async (mongoose) => {
                            try {
                                const results = await warnSchema.find({ guildId, userId });
                                const warnCount = results.length;

                                if (warnCount >= 3) {
                                    let dmFail = false;
                                    let banFail = false;

                                    await target.send({
                                        content: `${process.env.BOT_DENY} \`You have been permanently banned from ${guild.name}\`
                                                                                
**Reason**
> Warning threshold reached`
                                    }).catch(() => dmFail = true);

                                    let replyMsg = dmFail ? `${process.env.BOT_DENY} \`Your warning was added, but I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`Your warning was added\``;

                                    await target.ban({
                                        days: 0,
                                        reason: `Warning threshold reached`
                                    }).catch(() => banFail = true);

                                    let banMsg = banFail ? `${process.env.BOT_DENY} \`I could not ban ${target.user.tag}\`` : `${process.env.BOT_CONF} \`${target.user.tag} was banned\``;

                                    await interaction.reply({
                                        content: `${replyMsg}
${banMsg}`,
                                        ephemeral: true
                                    });
                                } else {
                                    let dmFail = false;

                                    await target.send({
                                        content: `${process.env.BOT_DENY} \`You received a warning in ${guild.name}. You now have ${warnCount}/3 warnings!\`
                                                                                
**Reason**
> ${reason}`
                                    }).catch(() => dmFail = true);

                                    let replyMsg = dmFail ? `${process.env.BOT_DENY} \`Your warning was added, but I could not send ${target.user.tag} a notification\`` : `${process.env.BOT_CONF} \`Your warning was added\``;

                                    interaction.reply({
                                        content: `${replyMsg}`,
                                        ephemeral: true
                                    });
                                }
                            } finally {
                                mongoose.connection.close().catch(() => { return });
                            }
                        })
                    })
                }
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const warning = options.getString('warning');

                    await mongo().then(async mongoose => {
                        try {
                            const results = await warnSchema.find({ warnId: warning })

                            if (results.length > 0) {
                                await warnSchema.findOneAndRemove({ warnId: warning }).then(() => interaction.reply({
                                    content: `${process.env.BOT_CONF} \`Warning '${warning}' removed\``,
                                    ephemeral: true
                                }));
                            } else {
                                await interaction.reply({
                                    content: `${process.env.BOT_DENY} \`Warning '${warning}' does not exist or has already been deleted\``,
                                    ephemeral: true
                                });
                            }
                        } finally {
                            mongoose.connection.close().catch(() => { return });
                        }
                    });
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
                                .setAuthor(`Warnings for ${target.user.tag}`, `${target.user.displayAvatarURL({ dynamic: true })}`)
                                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                                .setTimestamp()

                            if (results.length < 1) {
                                warningEmbed.setDescription(`The user has no warnings`)
                            } else {

                                warnCount = `0`
                                for (const warning of results) {
                                    const { warnId, author, timestamp, reason } = warning
                                    warnCount++

                                    warningEmbed.addField(`#${warnCount}
🆔 Warning ID:`, `${warnId}
⠀`, false)
                                    warningEmbed.addField(`🛡️ Staff Member:`, `<@${author}>
⠀`, false)
                                    warningEmbed.addField(`✏️ Reason:`, `${reason} *- ${moment(timestamp).format('llll')}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, false)
                                }
                            }

                            interaction.reply({
                                embeds: [warningEmbed],
                                ephemeral: true
                            });
                        } finally {
                            mongoose.connection.close().catch(err => { return; });
                        }
                    });
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}