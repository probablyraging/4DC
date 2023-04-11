module.exports = async (message) => {
    const premReactions = ['<a:ftcplusplus3:1063240422815707237>', '<:ftcplusplus:1061590380279251004>', '<:ftcplus2:1061555522005909605>', '<:ftcplus:1061555457535262810>'];
    const boostReactions = ['<:gg:830239353917800468>', '<:booster:931461963517685801>', '<a:booster:1002650562183057499>', '<:booster_heart:1041122697360441424>'];
    const usedReactions = new Set();

    if (message.channel.id === process.env.BOOST_CHAN) {
        // If message is a premium subscription
        if (message.type === 25) {
            while (usedReactions.size < 3) {
                const randomIndex = Math.floor(Math.random() * premReactions.length);
                if (!usedReactions.has(randomIndex)) {
                    message.react(premReactions[randomIndex]).catch(() => { });
                    usedReactions.add(randomIndex);
                }
            }
        }
        // If message is a guild boost
        if (message.type === 8) {
            const usedReactions = new Set();
            while (usedReactions.size < 3) {
                const randomIndex = Math.floor(Math.random() * boostReactions.length);
                if (!usedReactions.has(randomIndex)) {
                    message.react(boostReactions[randomIndex]).catch(() => { });
                    usedReactions.add(randomIndex);
                }
            }
        }
        // Clear used reaction each iteration
        usedReactions.clear();
    }
}