const { ActivityType } = require('discord.js');
const { dbUpdateOne } = require('../../utils/utils');
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

async function featuredRandomPicker(client, previouslyFeatured) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
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

    if (liveArr.length >= 1) {
        const rand = Math.floor(Math.random() * liveArr.length);
        const randUser = liveArr[rand];
        // Feature a new member each time and make sure their activity has a URL
        if (previouslyFeatured != randUser.id && randUser.url) {
            // Set a timestamp 1 hour from the current time
            const setHours = new Date().setHours(new Date().getHours() + 2);
            await dbUpdateOne(timerSchema, { timer: 'featured' }, { timestamp: setHours, previouslyFeatured: randUser.id });
            // Give the user the featured role
            await guild.members.fetch(randUser.id).then(member => {
                member?.roles.add(process.env.FEATURED_ROLE).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            })
        } else {
            // If the random member was the previous feature or if they didn't have an activity URL
            featuredRandomPicker(client, previouslyFeatured);
        }
    }
}

module.exports = {
    featuredRandomPicker
}