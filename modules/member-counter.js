require('dotenv').config();

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.SERVER_ID);

    setInterval(() => {
        guild.members.fetch().then(async fetchedMembers => {
            // TODO : Is there a reason we can't use totalOnline?
            // let totalOnline = fetchedMembers.filter(member => member.presence.status !== 'offline').size;

            let totalIdle = fetchedMembers.filter(member => member.presence.status === 'idle').size;
            let totalDnd = fetchedMembers.filter(member => member.presence.status === 'dnd').size;

            let activityTypes = ["STREAMING", "PLAYING", "WATCHING", "COMPETING", "CUSTOM"];
            let totalMap = {};

            for (let j = 0; j < activityTypes.length; j++) {
                let activityType = activityTypes[j];
                // We init the totalMap with a 0 for each activity straight away, so it's not undefined when we fetch it later
                totalMap.set(activityType, 0);
                for (let i = 0; i < 5; i++) {
                    fetchedMembers.forEach(member => {
                        if (member.presence.activities[i] && member.presence.activities[i].type === activityType) {
                            let amount = totalMap.get(activityType) + 1;
                            totalMap.set(activityType, amount);
                        }
                    })
                }
            }

            let totalMapSum = Object.values(totalMap).reduce((accumulator, value) => accumulator + value, 0);
            let totalAll = totalIdle + totalDnd + totalMapSum + 130;
            let memberCount = guild.memberCount;

            function kFormatter(num) {
                return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num)
            }

            let onlineReal = kFormatter(totalAll);
            let totalReal = kFormatter(memberCount);

            const channelOnline = guild.channels.cache.get(process.env.VC_ONLINE);
            const channelTotal = guild.channels.cache.get(process.env.VC_TOTAL);
            channelOnline.setName(`Online Members: ${onlineReal}`);
            channelTotal.setName(`Total Members: ${totalReal}`);

        })
    }, 600000);
};
