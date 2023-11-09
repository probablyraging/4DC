const { dbUpdateOne } = require('../../utils/utils');
const inviteSchema = require('../../schemas/misc/invite_schema');
const previouslyBannedUsers = require('../../lists/previous_bans');
const previousMutesCheck = require('../../modules/moderation/previous_mutes');
const { default: axios } = require('axios');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        // Add all new user to the unverified role
        if (member) await member.roles.add(process.env.UNVERIFIED_ROLE).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role to a user: `, err));

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

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_JOIN} ${member} joined. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // TEMPORARY: Kick users with account age <1 month
        const oneMonth = 24 * 30 * 60 * 60 * 1000;
        if ((new Date() - member.user.createdTimestamp) < oneMonth) {
            member.send({
                content: `## Unable To Join Server \n> Your account must be **__older than one month__** before you can join ContentCreator. \n> Feel free to join again once your account meets these requirements. \n\n*ContentCreator Server Staff*`
            }).catch(() => { });
            member.kick('Account age less than 1 month').catch(err => console.error(`${path.basename(__filename)} There was a problem kicking a user from the server: `, err));
            return;
        }

        // Check if the user was muted, and left the server while a mute was action
        previousMutesCheck(member, client);

        // Give the user 5 minutes to verify themselves, or kick them
        const timeToKick = Math.round((new Date().valueOf() + 300000) / 1000);
        member.send({
            content: `## Please Verify Yourself \nYou can verify yourself by going to <#1162008778061905992> and following the prompts \nYou will be kicked from the server <t:${timeToKick}:R> if you do not verify in time \n\n*ContentCreator Server Staff*`
        }).catch(() => { });
        setTimeout(() => {
            if (member && member.roles.cache.has(process.env.UNVERIFIED_ROLE)) {
                member.kick('Did not verify in time').catch(err => console.error(`${path.basename(__filename)} There was a problem kicking a user from the server: `, err));
            }
        }, 300000);

        // Check user's profile for blocked words and report to staff if a match is found
        axios.get(`https://discord.com/api/v9/users/${member.id}/profile`, { headers: { 'authorization': process.env.SB_TOKEN } })
            .then((response) => {
                const blockedWords = ['artist', 'design', 'illustrat', 'dm', 'graphic', 'gfx', 'message', 'commission', 'professional', 'nft', 'service', 'promot', 'manag', 'market', 'edit', 'expert', 'agent', 'agency'];
                let matched = false;
                const matches = {
                    'Username': [],
                    'Display Name': [],
                    'Bio': [],
                };
                for (const i in blockedWords) {
                    if (member.user.username.toLowerCase().includes(blockedWords[i])) {
                        matched = true;
                        matches['Username'].push(`\`${blockedWords[i]}\``);
                    }
                    if (member.displayName.toLowerCase().includes(blockedWords[i])) {
                        matched = true;
                        matches['Display Name'].push(`\`${blockedWords[i]}\``);
                    }
                    if (response.data.user.bio.toLowerCase().includes(blockedWords[i])) {
                        matched = true;
                        matches['Bio'].push(`\`${blockedWords[i]}\``);
                    }
                }
                if (matched) {
                    const reason = `Blocked word(s) found in <@${member.id}>'s profile:\n`;
                    const reasonLines = [];

                    if (matches['Username'].length > 0) {
                        reasonLines.push(`- **Username**: ${matches['Username'].join(', ')}`);
                    }
                    if (matches['Display Name'].length > 0) {
                        reasonLines.push(`- **Display Name**: ${matches['Display Name'].join(', ')}`);
                    }
                    if (matches['Bio'].length > 0) {
                        reasonLines.push(`- **Bio**: ${matches['Bio'].join(', ')}`);
                    }

                    if (reasonLines.length > 0) {
                        const finalReason = reason + reasonLines.join('\n');

                        guild.channels.cache.get(process.env.STAFF_CHAN).send({
                            content: `<@&${process.env.STAFF_ROLE}>\n${finalReason}`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
            })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a user profile: `, err));

        // TEMPORARY: Check a list of previously banned user UDs
        previouslyBannedUsers.ids.forEach(id => {
            try {
                if (member.id === id) {
                    guild.channels.cache.get(process.env.STAFF_CHAN).send({
                        content: `<@&${process.env.STAFF_ROLE}> \n${member} was flagged as being previously banned, do with this information what you will. I vote we ban them :smiling_imp:`
                    });
                }
            } catch (err) {
                console.error('There was a problem with matching previously banned users: ', err);
            }
        });
    }
}