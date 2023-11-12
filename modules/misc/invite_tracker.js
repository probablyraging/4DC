const inviteSchema = require('../../schemas/invite_schema');
const { dbUpdateOne } = require('../../utils/utils');
const path = require('path');

module.exports = async (member, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);

    // Invite tracker
    guild.invites.fetch().then(async invites => {
        let vanity = true;
        // Find all invites in the database with at least 1 use
        const results = await inviteSchema.find({ uses: { $gt: 0 } }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
        for (const data of results) {
            const { code, userId, uses } = data;

            invites.forEach(async i => {
                // Check if invite code and use count match and the invite has more uses
                if (i.code === code && i.uses > uses) {
                    vanity = false;

                    const inviter = client.users.cache.get(userId);
                    // Update the database with the new use count
                    await dbUpdateOne(inviteSchema, { code: code }, { uses: i.uses });
                    // If the invite is from DISBOARD
                    if (userId === process.env.DISBOARD_ID) {
                        return inviteChan.send({
                            content: `${member.user.username} was invited by ${inviter.username} who now has **${9347 + parseInt(i.uses)}** invites`,
                            allowedMentions: { parse: [] },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                    // Log to the invite channel
                    inviteChan.send({
                        content: `${member.user.username} was invited by ${inviter.username} who now has **${i.uses}** invites`,
                        allowedMentions: { parse: [] },
                        failIfNotExists: false
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            });
        }
        // If the user joined via a vanity URL
        if (vanity) {
            return inviteChan.send({
                content: `${member.user.username} joined using a vanity invite`,
                allowedMentions: { parse: [] },
                failIfNotExists: false
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    });
}