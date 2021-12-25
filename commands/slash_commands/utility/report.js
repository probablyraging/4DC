require('dotenv').config();
const {MessageEmbed} = require('discord.js');
const {v4: uuidv4} = require('uuid');
const {addCooldown, hasCooldown, removeCooldown} = require('../../../modules/report_cooldown');

module.exports = {
    name: "report",
    description: "Report a user to the CreatorHub staff",
    permission: ``,
    type: `CHAT_INPUT`,
    usage: `/report [@username] [reason] (imageURL)`,
    options: [
        {
            name: "username",
            description: "The user to report",
            type: "USER",
            required: true
        },
        {
            name: "reason",
            description: "Why the user is being reported",
            type: "STRING",
            required: true
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});

        const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
        const staffChannel = interaction.client.channels.cache.get(process.env.STAFF_CHAT);
        const reportId = uuidv4();
        const {user, options} = interaction;

        const target = options.getMember('username');
        const reason = options.getString('reason');

        if (reason && reason.length > 1024) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`Permissions field exceeds 1024 characters\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        if (!hasCooldown(user.id)) {
            const reportEmbed = new MessageEmbed()
                .setColor('#E04F5F')
                .setAuthor(`${user.tag}`, user.displayAvatarURL({dynamic: true}))
                .addField(`Reported User:`, `<@${target.id}>`, false)
                .addField(`Reason:`, `\`\`\`${reason}\`\`\``, false)
                .setFooter(`${guild.name} • Report ID ${reportId}`, `${guild.iconURL({dynamic: true})}`)
                .setTimestamp();

            const reactionMessage = await staffChannel.send({embeds: [reportEmbed]}).catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));

            await reactionMessage.react('⛔').catch(err => console.error(`Could not react to message '${reportId}': `, err));

            const filter = (reaction, user) => {
                return guild.members.cache.find((member) => member.id === user.id).permissions.has("MANAGE_MESSAGES");
            };

            const collector = reactionMessage.createReactionCollector({filter, dispose: true});

            collector.on("collect", (reaction, closingUser) => {
                if (!closingUser.bot && reaction.emoji.name === "⛔") {
                    const closedEmbed = new MessageEmbed(reportEmbed)
                        .addField(`Closed By:`, `${closingUser}`, false)
                        .setColor('#32BEA6');
                    reactionMessage.edit({embeds: [closedEmbed]});
                    reactionMessage.reactions.resolve('⛔').remove('⛔');

                    const replyEmbed = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`CreatorHub Report`)
                        .setAuthor(`${user.tag}`, `${user.displayAvatarURL({dynamic: true})}`)
                        .setDescription(`Your report's status has been updated to \`CLOSED\``)
                        .addField(`Report Message:`, `\`\`\`${reason}\`\`\``, false)
                        .addField(`Closed By:`, `${closingUser}`, false)
                        .setFooter(`${guild.name} • Report ID: ${reportId}`, `${guild.iconURL({dynamic: true})}`)
                        .setTimestamp();

                    user.send({embeds: [replyEmbed]}).catch(err => {
                        console.error("There was a problem sending a DM to the user: ", err);
                    });
                }
            });

            addCooldown(user.id);

            setTimeout(() => {
                removeCooldown(user.id);
            }, 60000);

            await interaction.editReply({content: "Your report has been submitted."}).catch(err => console.error("There was a problem replying to the interaction: ", err));
        } else {
            await interaction.editReply({content: "You must wait 60 seconds before submitting another report."}).catch(err => console.error("There was a problem replying to the interaction: ", err));
        }
    }
};
