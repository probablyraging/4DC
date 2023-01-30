const { dbUpdateOne } = require('../../utils/utils');
const inviteSchema = require('../../schemas/misc/invite_schema');
const previouslyBannedUsers = require('../../lists/previous_bans');
const previousMutesCheck = require('../../modules/misc/previous_mutes_check');
const newUsers = new Set();
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        if (member.guild.id === process.env.SHARE_GUILD) {
            const mainGuild = client.guilds.cache.get(process.env.GUILD_ID);
            const mainGuildMember = await mainGuild.members.fetch(member.id).catch(() => { });
            // Staff roles
            if (mainGuildMember?.roles.cache.has(process.env.STAFF_ROLE)) member.roles.add('1069322534748700774');
            // Supporter roles
            if (mainGuildMember?.roles.cache.has(process.env.BOOSTER_ROLE) || mainGuildMember.roles.cache.has(process.env.SUBSCRIBER_ROLE)) member.roles.add('1069330873637412924');
            // Rank roles
            if (mainGuildMember?.roles.cache.has(process.env.RANK5_ROLE)) member.roles.add('1069331120019210410');
            if (mainGuildMember?.roles.cache.has(process.env.RANK10_ROLE)) member.roles.add('1069331129464787054');
            if (mainGuildMember?.roles.cache.has(process.env.RANK15_ROLE)) member.roles.add('1069331143062732931');
            if (mainGuildMember?.roles.cache.has(process.env.RANK20_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK25_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK30_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK35_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK40_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK45_ROLE) || mainGuildMember.roles.cache.has(process.env.RANK50_ROLE)) member.roles.add('1069331140936224809');
            return;
        }

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        previousMutesCheck(member, client);

        // Add all new user to a set
        newUsers.add(member.id);

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_JOIN} ${member} joined. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

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
                                content: `${member.user.tag} was invited by ${inviter.tag} who now has **${9347 + parseInt(i.uses)}** invites`,
                                allowedMentions: { parse: [] },
                                failIfNotExists: false
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                        // Log to the invite channel
                        inviteChan.send({
                            content: `${member.user.tag} was invited by ${inviter.tag} who now has **${i.uses}** invites`,
                            allowedMentions: { parse: [] },
                            failIfNotExists: false
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                });
            }
            // If the user joined via a vanity URL
            if (vanity) {
                return inviteChan.send({
                    content: `${member.user.tag} joined using a vanity invite`,
                    allowedMentions: { parse: [] },
                    failIfNotExists: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        });

        // TEMPORARY: Check a list of previously banned user UDs
        previouslyBannedUsers.ids.forEach(id => {
            try {
                if (member.id === id) {
                    guild.channels.cache.get(process.env.STAFF_CHAN).send({
                        content: `<@&${process.env.STAFF_ROLE}> \n${member} was flagged as being previous banned, do with this information what you will. I vote we ban them :smiling_imp:`
                    })
                }
            } catch (err) {
                console.error('There was a problem with matching previously banned users: ', err);
            }
        });
    },
    // Export the newUser set
    newUsers
}