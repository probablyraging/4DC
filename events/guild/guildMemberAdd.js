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
                await generalChan.createWebhook({ name: client.user.username, avatar: client.user.avatarURL({ format: 'png', size: 256 }) }).then(async webhook => {
                    if (newUsers.size === 0) return;
                    if (newUsers.size === 1) {
                        await webhook.send({
                            content: `We have a new friend! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourself when you're ready :slight_smile:`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err)).then(webhookMessage => {
                            setTimeout(() => {
                                // Delete the webhook message after five minutes
                                webhookMessage.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleted a webhook message: `, err));
                            }, 300000);
                        });
                    } else if (newUsers.size > 1) {
                        await webhook.send({
                            content: `We have some new friends! <:squee:838443107988799498> Welcome to the server <@${Array.from(newUsers).join('>, <@')}>! :wave: Feel free to introduce yourselves when you're ready :slight_smile:`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err)).then(webhookMessage => {
                            setTimeout(() => {
                                // Delete the webhook message after five minutes
                                webhookMessage.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleted a webhook message: `, err));
                            }, 300000);
                        });
                    }
                    setTimeout(() => {
                        // Delete the webhook
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 5000);
                    // Clear the set
                    newUsers.clear();
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
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

                        inviteChan.send({
                            content: `${member.user.tag} was invited by ${inviter.tag} who now has **${i.uses}** invites`,
                            allowedMentions: { parse: [] },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                        await inviteSchema.updateOne({
                            code: code
                        }, {
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
                    allowedMentions: { parse: [] },
                    failIfNotExists: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        });
    },
    newUsers
}