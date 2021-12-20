require('dotenv').config();

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(() => {
        guild.members.fetch().then(async fetchedMembers => {
            // TODO : Check why discord is reporting the user number incorrectly - off by roughly 130
            let totalOnline = fetchedMembers.filter(member => member.presence?.status !== 'offline').size + 130;
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
