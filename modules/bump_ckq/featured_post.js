const { ActivityType } = require('discord.js');
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

async function featuredRandomPicker(client, previouslyFeatured) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const featuredChan = guild.channels.cache.get(process.env.FEATURED_CHAN);
    // Fetch all members with the streaming activity
    let liveArr = [];
    await guild.members.fetch().then(async fetchedMembers => {
        await fetchedMembers.forEach(member => {
            for (let i = 0; i < 5; i++) {
                if (!member.user.bot && member.presence?.activities[i] && member.presence?.activities[i].type === ActivityType.Streaming) {
                    liveArr.push({ id: member.user.id, username: member.user.username, url: member.presence?.activities[i].url, state: member.presence?.activities[i].state });
                }
            }
        });
    });
    let updatedMessage;
    if (liveArr.length < 1) {
        // If there no active streams
        updatedMessage = `There are currently no ForTheContent members streaming, I'll check again in 60 minutes`;
        // Fetch and delete the previous message
        await featuredChan.messages.fetch({ limit: 1 }).then(fetched => {
            fetched.forEach(message => {
                if (message.content.length !== 0) {
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                }
            })
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));
        featuredChan.send({ content: updatedMessage }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
    } else {
        const rand = Math.floor(Math.random() * liveArr.length);
        const randUser = liveArr[rand];
        // Feature a new member each time and make sure their activity has a URL
        if (previouslyFeatured != randUser.id && randUser.url) {
            let platform = 'Other';
            if (randUser.url.split('/').includes('www.twitch.tv')) platform = 'Twitch';
            if (randUser.url.split('/').includes('youtube.com')) platform = 'YouTube';
            if (randUser.state) {
                updatedMessage = `<@${randUser.id}> is streaming ${randUser.state} on ${platform} - ${randUser.url}`;
            } else {
                updatedMessage = `<@${randUser.id}> is streaming on ${platform} - ${randUser.url}`;
            }
            // Fetch and delete the previous featured post
            await featuredChan.messages.fetch({ limi: 1 }).then(fetched => {
                fetched.forEach(message => {
                    if (message.content.length !== 0) {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }
                })
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));
            // Set a timestamp 1 hour from the current time
            const setHours = new Date().setHours(new Date().getHours() + 2);
            await timerSchema.findOneAndUpdate({
                searchFor: 'featuredTime'
            }, {
                timestamp: setHours,
                searchFor: 'featuredTime',
                previouslyFeatured: randUser.id
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updated a database entry: `, err));
            // Send the message
            featuredChan.send({ content: updatedMessage, allowedMentions: { parse: [] } }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
            // Give the user the featured role
            await guild.members.fetch(randUser.id).then(member => {
                member?.roles.add(process.env.FEATURED_ROLE).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            })
        } else {
            // If the random member was the previous feature or if they didn't have an activity URL
            await featuredChan.messages.fetch({ limi: 1 }).then(fetched => {
                fetched.forEach(message => {
                    if (message.content.length !== 0) {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }
                })
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));
            featuredRandomPicker(client, previouslyFeatured);
        }
    }
}

module.exports = {
    featuredRandomPicker
}