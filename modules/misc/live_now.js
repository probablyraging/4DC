const path = require('path');
const streamSchema = require('../../schemas/misc/stream_schema');
const tokensSchema = require('../../schemas/misc/tokens_schema');
const cooldown = new Set();
/**
 * @param {Message} message 
 */
module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
    const boostRole = guild.roles.cache.get(process.env.BOOSTER_ROLE);
    const liveRole = guild.roles.cache.get(process.env.LIVE_ROLE);

    const boostPromoChan = guild.channels.cache.get(process.env.BOOSTER_PROMO);
    const contentShare = guild.channels.cache.get(process.env.CONTENT_SHARE);

    function filterArr(value, index, self) {
        return self.indexOf(value) === index;
    }

    setInterval(async () => {
        // Staff member check
        liveStaff = [];

        await staffRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]?.url && (member?.presence?.activities[i]?.name === 'Twitch' || member?.presence?.activities[i]?.name === 'YouTube')) {
                    liveStaff.push({ username: member?.user?.username, id: member?.user?.id, platform: member?.presence?.activities[i]?.name, url: member?.presence?.activities[i]?.url })
                }
            }
        });

        let liveStaffArr = liveStaff.filter(filterArr);

        for (let i = 0; i < liveStaffArr?.length; i++) {
            const userId = liveStaffArr[i]?.id;

            const results = await streamSchema.find({ userId: userId })

            if (results?.length < 1) {
                await streamSchema.updateOne({
                    userId,
                }, {
                    userId,
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                guild.members.cache.get(liveStaffArr[i]?.id).roles.add(liveRole)
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                // Check if user has already manually posted their own link, if so we don't post it
                let boostAlreadyPosted = false;
                let shareAlreadyPosted = false;
                (await boostPromoChan.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveStaffArr[i]?.url.split('https://www.')[0])) boostAlreadyPosted = true;
                });
                (await contentShare.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveStaffArr[i]?.url.split('https://www.')[0])) shareAlreadyPosted = true;
                });

                if (!cooldown.has(liveStaffArr[i]?.id)) {
                    if (liveStaffArr[i]?.url === null) return;
                    contentShare.send({ content: `**${liveStaffArr[i]?.username}** just went live - ${liveStaffArr[i]?.url}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    // we only allow the bot to send one notification every 6 hours
                    cooldown.add(liveStaffArr[i]?.id)

                    setTimeout(() => {
                        cooldown.delete(liveStaffArr[i]?.id)
                    }, 1000 * 21600);
                }
            }
        }

        // Tokens item check
        const results = await tokensSchema.find();

        let liveMember = [];

        await results.forEach(async result => {
            if ((result?.twitchauto - new Date()) > 1 || result?.twitchauto === true) {
                const member = await guild.members.fetch(result.userId);
                for (let i = 0; i < 7; i++) {
                    if (member?.presence?.activities[i]?.url && (member?.presence?.activities[i]?.name === 'Twitch' || member?.presence?.activities[i]?.name === 'YouTube')) {
                        liveMember.push({ username: member?.user?.username, id: member?.user?.id, platform: member?.presence?.activities[i]?.name, url: member?.presence?.activities[i]?.url })
                    }
                }
            }
        });

        let liveMemberArr = liveMember.filter(filterArr);

        for (let i = 0; i < liveMemberArr?.length; i++) {
            const userId = liveMemberArr[i]?.id;

            const results2 = await streamSchema.find({ userId: userId })

            if (results2?.length < 1) {
                await streamSchema.updateOne({
                    userId,
                }, {
                    userId,
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                guild.members.cache.get(liveMemberArr[i]?.id).roles.add(liveRole)
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                // Check if user has already manually posted their own link, if so we don't post it
                let boostAlreadyPosted = false;
                let shareAlreadyPosted = false;
                (await boostPromoChan.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveMemberArr[i]?.url.split('https://www.')[0])) boostAlreadyPosted = true;
                });
                (await contentShare.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveMemberArr[i]?.url.split('https://www.')[0])) shareAlreadyPosted = true;
                });

                if (!cooldown.has(liveMemberArr[i]?.id)) {
                    if (liveMemberArr[i]?.url === null) return;
                    contentShare.send({ content: `**${liveMemberArr[i]?.username}** just went live - ${liveMemberArr[i]?.url}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    // we only allow the bot to send one notification every 6 hours
                    cooldown.add(liveMemberArr[i]?.id)

                    setTimeout(() => {
                        cooldown.delete(liveMemberArr[i]?.id)
                    }, 1000 * 21600);
                }
            }
        }

        // Booster member check
        liveBooster = [];

        await boostRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]?.url && (member?.presence?.activities[i]?.name === 'Twitch' || member?.presence?.activities[i]?.name === 'YouTube')) {
                    liveBooster.push({ username: member?.user?.username, id: member?.user?.id, platform: member?.presence?.activities[i]?.name, url: member?.presence?.activities[i]?.url })
                }
            }
        });

        let liveBoosterArr = liveBooster.filter(filterArr);

        for (let i = 0; i < liveBoosterArr?.length; i++) {
            const userId = liveBoosterArr[i]?.id;

            const results = await streamSchema.find({ userId: userId })

            if (results?.length < 1) {
                await streamSchema.updateOne({
                    userId,
                }, {
                    userId,
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                guild.members.cache.get(liveBoosterArr[i].id).roles.add(liveRole)
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                // Check if user has already manually posted their own link, if so we don't post it
                let boostAlreadyPosted = false;
                let shareAlreadyPosted = false;
                (await boostPromoChan.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveBoosterArr[i]?.url.split('https://www.')[0])) boostAlreadyPosted = true;
                });
                (await contentShare.messages.fetch({ limit: 5 })).forEach(message => {
                    if (message.content.includes(liveBoosterArr[i]?.url.split('https://www.')[0])) shareAlreadyPosted = true;
                });

                if (!cooldown.has(liveBoosterArr[i]?.id)) {
                    if (liveBoosterArr[i]?.url === null) return;
                    if (!boostAlreadyPosted) boostPromoChan.send({ content: `**${liveBoosterArr[i]?.username}** just went live - ${liveBoosterArr[i]?.url}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    if (!shareAlreadyPosted) contentShare.send({ content: `**${liveBoosterArr[i]?.username}** just went live - ${liveBoosterArr[i]?.url}` })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    // we only allow the bot to send one notification every 6 hours
                    cooldown.add(liveBoosterArr[i]?.id)

                    setTimeout(() => {
                        cooldown.delete(liveBoosterArr[i]?.id)
                    }, 1000 * 21600);
                }
            }
        }
    }, 10000);

    // check live now role to see if someone stopped streaming
    setInterval(async () => {
        const liveNow = new Map();

        liveRole?.members?.forEach(async member => {
            for (let i = 0; i < member?.presence?.activities?.length; i++) {
                if (member?.presence?.activities[i]?.url && (member?.presence?.activities[i]?.name === 'Twitch' || member?.presence?.activities[i]?.name === 'YouTube')) {
                    liveNow.set(member?.id);
                }
            }

            if (!liveNow.has(member.id)) {
                await streamSchema.findOneAndRemove({ userId: member.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));

                guild.members.cache.get(member.id).roles.remove(liveRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            }
        });
    }, 300000);
}