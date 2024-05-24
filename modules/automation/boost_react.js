const usedReactions = new Set();

export default async (message) => {
    const boostReactions = ['<:gg:830239353917800468>', '<:booster:931461963517685801>', '<a:booster:1002650562183057499>', '<:booster_heart:1041122697360441424>'];

    if (message.channel.id === process.env.BOOST_CHAN) {
        // If message is a guild boost
        if (message.type === 8) {
            while (usedReactions.size < 3) {
                const randomIndex = Math.floor(Math.random() * boostReactions.length);
                if (!usedReactions.has(randomIndex)) {
                    message.react(boostReactions[randomIndex]).catch(err => console.error('There was a problem reacting to a boost message: ', err));
                    usedReactions.add(randomIndex);
                }
            }
        }
        // Clear used reaction each iteration
        usedReactions.clear();
    }
};