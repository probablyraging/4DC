require('dotenv').config();

module.exports = async (client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(() => {
        guild.members.fetch().then(async fetchedMembers => {
            console.log("Updating online members");
            fetchedMembers.forEach(member => {
                console.log(`Name: ${member.displayName}, Status: ${member.presence?.status}`);
            });

            let totalOnline = fetchedMembers.filter(member => member.presence && member.presence?.status !== 'offline').size;
            let memberCount = guild.memberCount;

            console.log(`Found ${totalOnline} members online out of ${memberCount} total members.`);

            function kFormatter(num) {
                return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num);
            }

            let onlineReal = kFormatter(totalOnline);
            let totalReal = kFormatter(memberCount);

            const channelOnline = guild.channels?.cache.get(process.env.VC_ONLINE);
            const channelTotal = guild.channels?.cache.get(process.env.VC_TOTAL);
            channelOnline.setName(`Online Members: ${onlineReal}`);
            channelTotal.setName(`Total Members: ${totalReal}`);

            console.log(`Set online channel name to ${onlineReal} and total channel name to ${totalReal}.`);
        })
    }, 600000);
};
