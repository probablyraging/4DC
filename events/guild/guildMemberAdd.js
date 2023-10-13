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

        // Check if the user was muted, and left the server while a mute was action
        previousMutesCheck(member, client);

        // Add all new user to the unverified role
        member.roles.add(process.env.UNVERIFIED_ROLE).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role to a user: `, err));

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

        // Get custom welcome message from OpenAi
        // const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);
        // try {
        //     // if (newUsers.size === 0) return;
        //     // Send request to the OpenAI API
        //     const requestData = {
        //         "model": "gpt-3.5-turbo",
        //         "messages": [
        //             { "role": "system", "content": `You are 4DC, a Discord bot on a server which offers help, advice, and support for content creators. Say something wholesome about this user's username. Strictly no longer than 30 words` },
        //             { "role": "user", "content": `${member.user.username}` }
        //         ],
        //         "temperature": 1.5,
        //         "max_tokens": 256
        //     };

        //     const headers = {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${process.env.OAI_KEY}`
        //     };

        //     const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, { headers });
        //     const data = response.data;

        //     // If the response is empty or there are no choices
        //     if (!data || !data.choices) {
        //         return;
        //     } else {
        //         const response = data.choices[0].message.content;
        //         // Send the welcome message
        //         const message = await generalChan.send({
        //             content: `Welcome ${member}. ${response}`
        //         }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing the webhook message: `, err));
        //         setTimeout(async () => {
        //             const exists = await generalChan.messages.fetch(message.id).catch(() => { });
        //             if (exists) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        //         }, 300000);
        //     }
        // } catch (err) {
        //     console.error('There was a problem with the welcome_message module: ', err);
        // }

        // TEMPORARY: Check a list of previously banned user UDs
        previouslyBannedUsers.ids.forEach(id => {
            try {
                if (member.id === id) {
                    guild.channels.cache.get(process.env.STAFF_CHAN).send({
                        content: `<@&${process.env.STAFF_ROLE}> \n${member} was flagged as being previously banned, do with this information what you will. I vote we ban them :smiling_imp:`
                    })
                }
            } catch (err) {
                console.error('There was a problem with matching previously banned users: ', err);
            }
        });
    },
    // Export the newUser set
    // newUsers
}