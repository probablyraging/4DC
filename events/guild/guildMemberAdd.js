const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const inviteChan = client.channels.cache.get(process.env.INVITE_CHAN);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        // Survey
        const btnCustoms = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('survey-reddit')
                    .setLabel('Reddit')
                    .setEmoji('1️⃣')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('survey-google')
                    .setLabel('Google')
                    .setEmoji('2️⃣')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('survey-youtube')
                    .setLabel('YouTube')
                    .setEmoji('3️⃣')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('survey-friend')
                    .setLabel('Friends or Family')
                    .setEmoji('4️⃣')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('survey-other')
                    .setLabel('Other')
                    .setEmoji('5️⃣')
                    .setStyle(ButtonStyle.Primary),
            );

        setTimeout(async () => {
            await member?.send({
                content: `Thanks for joining ForTheContent, would you mind answering a quick question?
    
**In an attempt to better understand our community, we would love to know how you heard about ForTheContent**

*Click one of the buttons below to submit your answer*`, components: [btnCustoms]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }, 30000);

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