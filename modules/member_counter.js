require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async (client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(() => {
        guild.members.fetch().then(async fetchedMembers => {

            const response = await fetch(`https://discord.com/api/v6/guilds/${process.env.GUILD_ID}/widget.json`);
            const data = await response.json();
            let totalOnline = data.presence_count;            
            let memberCount = guild.memberCount;

            function kFormatter(num) {
                return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num);
            }

            let onlineReal = kFormatter(totalOnline);
            let totalReal = kFormatter(memberCount);

            const channelOnline = guild.channels?.cache.get(process.env.VC_ONLINE);
            const channelTotal = guild.channels?.cache.get(process.env.VC_TOTAL);
            channelOnline.setName(`Online Members: ${onlineReal}`);
            channelTotal.setName(`Total Members: ${totalReal}`);
        })
    }, 600000);
};
