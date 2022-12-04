const { featuredRandomPicker } = require('./featured_post');
const timerSchema = require("../../schemas/misc/timer_schema");

module.exports = (client) => {
    setInterval(async () => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const featuredRole = guild.roles.cache.get(process.env.FEATURED_ROLE);
        const currentTime = new Date().valueOf();
        const results = await timerSchema.find({ timer: 'featured' });
        for (const data of results) {
            const { timestamp, previouslyFeatured } = data;
            if (timestamp < currentTime) {
            featuredRole.members.each(member => {
                member.roles.remove(featuredRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            })
            featuredRandomPicker(client, previouslyFeatured);
            }
        }
    }, 300000);
}