const { ThreadChannel } = require('discord.js');
const path = require('path');

module.exports = {
    name: `threadCreate`,
    /**
     * @param {ThreadChannel} thread
     */
    async execute(thread, newlyCreated, client) {
        // Information for video/gfx review threads
        if (newlyCreated && thread.parentId === process.env.REVIEW_CHAN) {
            setTimeout(() => {
                thread.send({
                    content: `This forum is focused on providing feedback about specific aspects of the creation process and not the overall video, graphic or other
<:minidot:923683258871472248> Is your post specific about what you want feedback on?
<:minidot:923683258871472248> Have you provided timestamps of the areas you want reviewed?
<:minidot:923683258871472248> Can you share references to what you would like to achieve?
<:minidot:923683258871472248> Example of a good title: "How can I mix my audio better at 3:20?"
<:minidot:923683258871472248> Example of a bad title: "Does this look good?"
If you need to edit your title or post, please do so now or it may be deleted`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }, 3000);
        }

        // Disclaimer for paid services in looking for stuff channel
        if (newlyCreated && thread.parentId === process.env.COMMISSIONS_CHAN && thread.appliedTags.includes('1052097998928224286')) {
            setTimeout(() => {
                thread.send({
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