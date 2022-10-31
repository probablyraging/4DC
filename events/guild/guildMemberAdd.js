const inviteSchema = require('../../schemas/misc/invite_schema');
const newUsers = new Set();
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);
        const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);

        // Add all new user to a set
        newUsers.add(member.id);
        // Periodically check our set size and send a welcome message in the general channel if needed
        setInterval(async () => {
            if (newUsers.size > 0) {
                if (newUsers.size === 0) return;
                if (newUsers.size === 1) {
                    generalChan.send({
                        content: `We have a new friend! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourself, shout yourself out *(no links)*, or just join the chat :slight_smile:`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err)).then(message => {
                        setTimeout(() => {
                            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook message: `, err));
                        }, 300000);
                    });
                } else if (newUsers.size > 1) {
                    generalChan.send({
                        content: `We have some new friends! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourselves, shout yourselves out *(no links)*, or just join the chat :slight_smile:`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err)).then(message => {
                        setTimeout(() => {
                            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook message: `, err));
                        }, 300000);
                    });
                }
                // Clear the set
                newUsers.clear();
            }
        }, 180000);

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_JOIN} ${member} joined. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // Invite tracker
        guild.invites.fetch().then(async invites => {
            let vanity = true;

            const results = await inviteSchema.find({ uses: { $gt: 0 } }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
            for (const data of results) {
                const { code, userId, uses } = data;

                invites.forEach(async i => {
                    if (i.code === code && i.uses > uses) {
                        vanity = false;

                        const inviter = client.users.cache.get(userId);

                        await inviteSchema.updateOne({
                            code: code
                        }, {
                            uses: i.uses
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        if (userId === process.env.DISBOARD_ID) {
                            return inviteChan.send({
                                content: `${member.user.tag} was invited by ${inviter.tag} who now has **${9347 + parseInt(i.uses)}** invites`,
                                allowedMentions: { parse: [] },
                                failIfNotExists: false
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }

                        inviteChan.send({
                            content: `${member.user.tag} was invited by ${inviter.tag} who now has **${i.uses}** invites`,
                            allowedMentions: { parse: [] },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                });
            }

            if (vanity) {
                return inviteChan.send({
                    content: `${member.user.tag} joined using a vanity invite`,
                    allowedMentions: { parse: [] },
                    failIfNotExists: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        });
    },
    newUsers
}