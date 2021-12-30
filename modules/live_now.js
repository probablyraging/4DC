const path = require('path');
const mongo = require('../mongo');
const streamSchema = require('../schemas/stream-schema');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
    const boostRole = guild.roles.cache.get(process.env.BOOST_ROLE);
    const liveRole = guild.roles.cache.get(process.env.LIVE_ROLE);
    const staffPromoChan = guild.channels.cache.get(process.env.STAFF_PROMO);
    const boostPromoChan = guild.channels.cache.get(process.env.BOOST_PROMO);
    const twitchPromoChan = guild.channels.cache.get(process.env.TWITCH_CHAN);

    function filterArr(value, index, self) {
        return self.indexOf(value) === index;
    }

    setInterval(async () => {
        // staff member check
        liveStaff = [];

        staffRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]?.name === 'Twitch') {

                    liveStaff.push({ username: member?.user?.username, id: member?.user?.id, url: member?.presence?.activities[i]?.url })
                }
            }
        });

        let liveStaffArr = liveStaff.filter(filterArr);

        await mongo().then(async mongoose => {
            try {
                for (let i = 0; i < liveStaffArr?.length; i++) {
                    const userId = liveStaffArr[i]?.id;

                    const results = await streamSchema.find({ userId: userId })

                    if (results?.length < 1) {
                        await streamSchema.findOneAndUpdate({
                            userId,
                        }, {
                            userId,
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        guild.members.cache.get(liveStaffArr[i].id).roles.add(liveRole)
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                        staffPromoChan.send({ content: `**${liveStaffArr[i]?.username}** just went live - ${liveStaffArr[i]?.url}` })
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                        twitchPromoChan.send({ content: `**${liveStaffArr[i]?.username}** just went live - ${liveStaffArr[i]?.url}` })
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
            } finally {
                // do nothing
            }
        })


        // booster member check
        liveBooster = [];

        boostRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]?.name === 'Twitch') {

                    liveBooster.push({ username: member?.user?.username, id: member?.user?.id, url: member?.presence?.activities[i]?.url })
                }
            }
        });

        let liveBoosterArr = liveBooster.filter(filterArr);

        await mongo().then(async mongoose => {
            try {
                for (let i = 0; i < liveBoosterArr?.length; i++) {
                    const userId = liveBoosterArr[i]?.id;

                    const results = await streamSchema.find({ userId: userId })

                    if (results?.length < 1) {
                        await streamSchema.findOneAndUpdate({
                            userId,
                        }, {
                            userId,
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        guild.members.cache.get(liveBoosterArr[i].id).roles.add(liveRole)
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                        boostPromoChan.send({ content: `**${liveBoosterArr[i]?.username}** just went live - ${liveBoosterArr[i]?.url}` })
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                        twitchPromoChan.send({ content: `**${liveBoosterArr[i]?.username}** just went live - ${liveBoosterArr[i]?.url}` })
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
            } finally {
                // do nothing
            }
        })
    }, 30000);

    // check live now role to see if someone stopped streaming
    setInterval(async () => {
        presenceArr = [];

        liveRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]) presenceArr.push(member?.presence?.activities[i]?.name);
            }

            if (!presenceArr.includes('Twitch')) {
                searchFor = member?.id;
                userId = member?.id;
                console.log(searchFor, userId)

                await mongo().then(async mongoose => {
                    try {
                        await streamSchema.findOneAndRemove({ userId: searchFor });
                    } finally {
                        // do nothing
                    }
                });
                member?.roles?.remove(liveRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            }
        });
    }, 10000);
}