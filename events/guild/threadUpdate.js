const { ThreadChannel } = require('discord.js');
const path = require('path');

module.exports = {
    name: `threadUpdate`,
    /**
     * @param {ThreadChannel} thread
     */
    async execute(oldThread, newThread, client) {
        // Disclaimer for paid services in looking for stuff channel
        if (newThread.parentId === process.env.LFS_CHAN && !oldThread.appliedTags.includes('1034360626245550090') && newThread.appliedTags.includes('1034360626245550090')) {
            setTimeout(() => {
                newThread.send({
                    content: `This thread has been tagged as a Paid Service
<:minidot:923683258871472248> Pay for services at your own risk
<:minidot:923683258871472248> Be cautious, ask for proof of previous work, and use a reputable payment system
ForTheContent is not responsible for any monetary loss when paying for a service in this forum. If you believe a user is scamming others, please contact a <@&1033563360660291615> member privately`,
                    allowedMentions: {
                        parse: []
                    }
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }, 3000);
        }
    }
}