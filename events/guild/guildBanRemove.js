const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const mongo = require("../../mongo");
const banUnbanSchema = require('../../schemas/database_logs/ban_unban_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: 'guildBanRemove',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const timestamp = new Date().getTime();

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanRemove,
            });

            const banLog = fetchedLogs.entries.first();
            const { executor } = banLog;

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#4fe059")
                .setAuthor({ name: `${executor?.tag}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${ban?.user.tag} *(${ban?.user.id})*`)
                .setFooter({ text: `Unban • ${uuidv4()}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/unban_icon.png' })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

            // Log to database for dashboard
            await mongo().then(async mongoose => {
                await banUnbanSchema.create({
                    userId: ban?.user.id,
                    username: ban?.user.tag,
                    author: executor?.id,
                    authorTag: `${executor?.username}#${executor?.discriminator}`,
                    timestamp: timestamp,
                    type: 'Unban'
                });
            });
        }, 2000);
    }
}