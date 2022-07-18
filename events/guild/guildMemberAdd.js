const { EmbedBuilder } = require('discord.js');
const mongo = require('../../mongo');
const inviteSchema = require('../../schemas/misc/invite_schema');
const chartData = require('../../schemas/database_logs/chart_data');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_JOIN} ${member} joined. There are now **${guild.memberCount}** members in the server`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

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
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
        });

        // Database charts
        const nowTimestamp = new Date().valueOf();
        const tsToDate = new Date(nowTimestamp);
        const months = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateToUTC = tsToDate.getUTCDate() + ' ' + months[tsToDate.getUTCMonth()] + ' ' + tsToDate.getUTCFullYear();

        const results = await chartData.find({ date: dateToUTC });

        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '1',
                leaves: '0',
                bans: '0',
                messages: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { joins } = data;
                currentJoins = joins;
                currentJoins++;
                await chartData.findOneAndUpdate({
                    date: dateToUTC
                }, {
                    joins: currentJoins.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }
}