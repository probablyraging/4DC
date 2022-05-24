const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const muteTimeoutSchema = require('../../schemas/database_logs/mute_timeout_schema');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(newMember, oldMember, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const userUpChan = client.channels.cache.get(process.env.USERUP_CHAN);
        // const botChan = client.channels.cache.get(process.env.BOT_CHAN);
        const mutesChan = client.channels.cache.get(process.env.MUTES_CHAN);

        // when a user boosts the server, send them a DM explaining the additional perks they get
        //         if (newMember?.premiumSince !== oldMember?.premiumSince) {
        //             newMember.send({ content: `Thanks for boosting CreatorHub ${newMember?.user.username},
        // You've unlocked some additional perks to better your experience on the server, you can read more about them below;

        // **CREATORHUB SERVER BOOSTER PERKS <:booster:931461963517685801>**
        // <:minidot:923683258871472248> The unique **Server Booster** role
        // <:minidot:923683258871472248> Access to the less competitive <#859117794779987978> content share channel
        // <:minidot:923683258871472248> Bypass the rank requirements for most of the locked channels
        // <:minidot:923683258871472248> <:twitch:837083090283003964> Automatic **Live Now** role when streaming on Twitch *
        // <:minidot:923683258871472248> <:twitch:837083090283003964> Automatically post your Twitch channel link to the <#859117794779987978> content share channel every time you go live on Twitch
        // <:minidot:923683258871472248> <:youtube:837083090441994240> Automatically post your YouTube video links to the <#859117794779987978> content share channel every time you upload new content to YouTube *
        // <:minidot:923683258871472248> Unlimited nickname changes while boosting
        // <:minidot:923683258871472248> Custom role, role icon and role color of your choosing *
        // <:minidot:923683258871472248> Custom sticker and emoji of your choosing *

        // * *To claim any of these perks, please contact a staff member*` }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        //         }

        // Nickname changes
        if (newMember?.nickname === null) {
            nName = newMember?.displayName
        } else {
            nName = newMember?.nickname
        }

        if (oldMember?.nickname === null) {
            oName = oldMember?.displayName
        } else {
            oName = oldMember?.nickname
        }

        if (newMember?.displayName !== oldMember?.displayName) {
            const log = new Discord.MessageEmbed()
                .setAuthor({ name: `${newMember?.user.tag}`, iconURL: newMember?.user.displayAvatarURL({ dynamic: true }) })
                .setColor('#FF9E00') // ORANGE
                .setDescription(`**<@${newMember?.id}> changed their nickname**
                
⠀`)
                .addField(`New Nickname`, `${nName}#${newMember?.user?.discriminator}`, true)
                .addField(`Old Nickname`, `${oName}#${oldMember?.user?.discriminator}`, true)
                .setThumbnail(`${newMember?.user?.displayAvatarURL({ dynamic: true })}`)
                .setFooter({ text: oldMember.guild.name })
                .setTimestamp()

            userUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            // botChan.send({
            //     content: `${oName}#${oldMember?.user?.discriminator} is now known as ${nName}#${newMember?.user?.discriminator}`
            // }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // Timeout logs
        if (oldMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            const timeoutExpire = oldMember?.communicationDisabledUntilTimestamp;
            const date = new Date(timeoutExpire).toLocaleString();

            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                action: 'MEMBER_UPDATE'
            });

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;            
            const toReason = reason || `None`;
            const timestamp = new Date().getTime();

            const log = new MessageEmbed()
                .setColor('#E04F5F')
                .setAuthor({ name: `Timeout added to ${oldMember?.user.tag}`, iconURL: oldMember?.user.displayAvatarURL({ dynamic: true }) })
                .addField(`Added By`, `${executor}`, false)
                .addField(`Reason`, `\`\`\`${toReason}\`\`\``, false)
                .addField(`Expires`, `\`\`\`${date}\`\`\``, false)
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()

            mutesChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            // Log to database for dashboard
            await mongo().then(async mongoose => {
                await muteTimeoutSchema.create({
                    userId: oldMember?.user.id,
                    username: oldMember?.user.tag,
                    author: executor?.id,
                    authorTag: `${executor?.username}#${executor?.discriminator}`,
                    reason: reason,
                    timestamp: timestamp,
                    type: 'Timeout'
                });
            });
        }
    }
}



