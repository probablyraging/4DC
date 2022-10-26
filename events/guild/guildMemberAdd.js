const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);
        const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);

        // Send a welcome message in the general channel
        generalChan.createWebhook({ name: client.user.username, avatar: client.user.avatarURL({ format: 'png', size: 256 }) }).then(webhook => {
            setTimeout(function () {
                webhook.send({
                    content: `Welcome to the server ${member}! Feel free to introduce yourself using our [introduction template](<https://discord.com/channels/820889004055855144/820889004055855147/1027187295398408202) when you're ready`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err)).then(wh => {
                    setTimeout(() => {
                        wh.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleted a webhook message: `, err))
                    }, 300000);
                })
                setTimeout(() => {
                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                }, 5000);
            }, 25000);
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

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
    }
}