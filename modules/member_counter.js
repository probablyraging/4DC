require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async (client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(() => {
        guild.members.fetch().then(async fetchedMembers => {

            const resolve = await fetch('https://discord.com/api/v9/guilds/820889004055855144?with_counts=true', { headers: { "Authorization": `Bot ${process.env.BOT_TOKEN}` } });
            const data = await resolve.json();
            let totalOnline = data.approximate_presence_count;
            let memberCount = guild.memberCount;

            function kFormatter(num) {
                return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num);
            }

            let onlineReal = kFormatter(totalOnline);
            let totalReal = kFormatter(memberCount);

            const channelOnline = guild.channels.cache.get(process.env.VC_ONLINE);
            const channelTotal = guild.channels.cache.get(process.env.VC_TOTAL);
            channelOnline.setName(`Online Members: ${onlineReal}`);
            channelTotal.setName(`Total Members: ${totalReal}`);
        })
    }, 600000);
};
