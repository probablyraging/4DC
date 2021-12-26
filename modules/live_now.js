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

    setInterval(() => {
        // staff member check
        staffRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i] && member?.presence?.activities[i]?.name === 'Twitch') {
                    searchFor = member?.id;
                    userId = member?.id;

                    await mongo().then(async mongoose => {
                        try {
                            const results = await streamSchema.find({ userId: searchFor });

                            if (results.length < 1) {
                                member?.roles.add(liveRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                                if (!member?.roles?.cache.has(boostRole)) {
                                    staffPromoChan.send({ content: `**${member?.user?.tag}** just went live - ${member?.presence?.activities[i]?.url}` })
                                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                                    twitchPromoChan.send({ content: `**${member?.user?.tag}** just went live - ${member?.presence?.activities[i]?.url}` })
                                        .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                                }
                                await streamSchema.findOneAndUpdate({
                                    userId,
                                }, {
                                    userId,
                                }, {
                                    upsert: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                            } else {
                                return;
                            }
                        } finally {
                            // do nothing
                        }
                    });
                }
            }
        });

        // booster member check
        boostRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i] && member?.presence?.activities[i]?.name === 'Twitch') {
                    searchFor = member?.id;
                    userId = member?.id;

                    await mongo().then(async mongoose => {
                        try {
                            const results = await streamSchema.find({ userId: searchFor });

                            if (results.length < 1) {
                                member?.roles.add(liveRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

                                boostPromoChan.send({ content: `**${member?.user?.tag}** just went live - ${member?.presence?.activities[i]?.url}` })
                                    .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                                twitchPromoChan.send({ content: `**${member?.user?.tag}** just went live - ${member?.presence?.activities[i]?.url}` })
                                    .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                                await streamSchema.findOneAndUpdate({
                                    userId,
                                }, {
                                    userId,
                                }, {
                                    upsert: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                            } else {
                                return;
                            }
                        } finally {
                            // do nothing
                        }
                    });
                }
            }
        });
    }, 30000);

    // check live new role to see if someone stopped streaming
    setInterval(async () => {
        presenceArr = [];

        liveRole?.members?.forEach(async member => {
            for (let i = 0; i < 7; i++) {
                if (member?.presence?.activities[i]) presenceArr.push(member?.presence?.activities[i]?.name);

                if (!presenceArr.includes('Twitch')) {
                    member?.roles?.remove(liveRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

                    searchFor = member?.id;
                    userId = member?.id;

                    await mongo().then(async mongoose => {
                        try {
                            const results = await streamSchema.find({ userId: searchFor });

                            if (results.length < 1) {
                                return;
                            } else {
                                await streamSchema.findOneAndRemove({ userId: searchFor }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
                            }
                        } finally {
                            // do nothing
                        }
                    });
                }
            }
        });
    }, 60000);
}