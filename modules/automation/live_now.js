import streamSchema from '../../schemas/stream_schema.js';
import { dbCreate, dbDeleteOne } from '../../utils/utils.js';

const cooldown = new Set();

/**
 * Fetches members that are currently streaming on YouTube or Twitch
 * @param {Object} staffRole The staff role to search for live members in
 * @param {Object} boostRole The booster role to search for live members in
 * @returns {Array} An array of members who are currently live on YouTube or Twitch
 */
async function getLiveMembers(staffRole, boostRole) {
    const liveNowMembers = [];
    const roles = [staffRole, boostRole];
    const platforms = ['Twitch', 'YouTube'];

    // Iterate through each role and fetch its members
    for (const role of roles) {
        role.members.map(async member => {
            // Iterate through each member's presence activities

            for (let i = 0; i < 7; i++) {
                const activity = member.presence?.activities[i];
                if (activity && platforms.includes(activity.name)) {
                    liveNowMembers.push({
                        username: member.user.username,
                        id: member.user.id,
                        platform: activity.name,
                        url: activity.url,
                        booster: member.premiumSinceTimestamp != null || member?.roles.cache.has(process.env.STAFF_ROLE) ? true : false,
                    });
                }
            }
        });
    }
    // Filter out any duplicates and 'undefined' items
    return liveNowMembers.filter((obj, index, array) => array.findIndex((t) => t.id === obj.id) === index);
}

export default async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
    const boostRole = guild.roles.cache.get(process.env.BOOSTER_ROLE);
    const liveRole = guild.roles.cache.get(process.env.LIVE_ROLE);
    const boostPromoChan = guild.channels.cache.get(process.env.SUPPORTER_CHAN);

    // Fetch live streaming mmbers
    setInterval(async () => {
        const liveNowMembers = await getLiveMembers(staffRole, boostRole);

        try {
            await Promise.all(liveNowMembers.map(async (liveMember) => {
                const { id } = liveMember;
                const results = await streamSchema.findOne({ userId: id });

                // If this user isn't already in the livenow database
                if (!results) {
                    await dbCreate(streamSchema, { userId: id });
                    guild.members.cache.get(id).roles.add(liveRole);
                    // If the user isn't already on cooldown
                    if (!cooldown.has(id)) {
                        // Check if user has already manually posted their own URL, if so we don't post it
                        let boostAlreadyPosted = false;
                        (await boostPromoChan.messages.fetch({ limit: 5 })).forEach(message => {
                            if (!liveMember.url) return;
                            if (message.content.includes(liveMember.url.split('https://www.')[1])) {
                                boostAlreadyPosted = true;
                            }
                        });
                        // If no URL was found, return
                        if (liveMember.url == null) return;
                        // Send the URL to the appropriate channels
                        if (!boostAlreadyPosted && liveMember.booster) {
                            boostPromoChan.send({
                                content: `**${liveMember.username}** just went live - ${liveMember.url}`,
                            });
                        }
                        // Add the user to a cooldown for 6 hours so we only send one live notice
                        cooldown.add(id);
                        setTimeout(() => {
                            cooldown.delete(id);
                        }, 1000 * 21600);
                    }
                }
            }));
        } catch (error) {
            console.error('There was a problem with the live_now module: ', error);
        }
    }, 300000);

    // Check live now role members to see if someone stopped streaming
    setInterval(async () => {
        liveRole?.members?.forEach(async member => {
            const activity = member.presence?.activities.find(a => (a.name === 'Twitch' || a.name === 'YouTube'));
            if (!activity) {
                guild.members.cache.get(member.id).roles.remove(liveRole).catch(err => console.error('There was a problem removing a role: ', err));
                await dbDeleteOne(streamSchema, { userId: member.id });
            }
        });
    }, 300000);
};