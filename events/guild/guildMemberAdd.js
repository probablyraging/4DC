const { MessageEmbed } = require('discord.js');
const mongo = require('../../mongo');
const inviteSchema = require('../../schemas/invite-schema');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChannel = client.channels.cache.get(process.env.JOINLEAVE_CHAN);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);

        /**
         * log new member joins
         */
        const memberCount = guild.memberCount;

        const log = new MessageEmbed()
            .setColor('#32BEA6')
            .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${member} joined

There are now **${memberCount}** members in the server`)
            .setThumbnail(`${member?.user.displayAvatarURL({ dynamic: true })}`)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        joinLeaveChannel.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

        /**
         * invite tracker
         */
        guild.invites.fetch().then(async invites => {
            let vanity = true;

            await mongo().then(async mongoose => {
                try {
                    const results = await inviteSchema.find({ uses: { $gt: 0 } }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    for (const data of results) {
                        const { code, userId, uses } = data;

                        invites.forEach(async i => {
                            if (i.code === code && i.uses > uses) {
                                vanity = false;
                                
                                const inviter = client.users.cache.get(userId);

                                inviteChan.send({
                                    content: `${member.user.tag} was invited by ${inviter.tag} who now has **${i.uses}** invites`,
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                                await inviteSchema.findOneAndRemove({ code: code }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a database entry: `, err));

                                await inviteSchema.findOneAndUpdate({
                                    code: code,
                                    userId: userId,
                                    uses: uses
                                }, {
                                    code: code,
                                    userId: userId,
                                    uses: i.uses
                                }, {
                                    upsert: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                            }
                        });
                    }

                    if (vanity) {
                        return inviteChan.send({
                            content: `${member.user.tag} joined using a vanity invite`,
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                } finally {
                    //do nothing
                }
            });
        });
    }
}