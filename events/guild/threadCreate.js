const { ThreadChannel } = require('discord.js');
const path = require('path');

module.exports = {
    name: `threadCreate`,
    /**
     * @param {ThreadChannel} thread
     */
    async execute(thread, newlyCreated, client) {
        if (newlyCreated && thread.parentId === process.env.REVIEW_CHAN) {
            thread.send({
                content: `This forum is focused on providing feedback about specific aspects of the creation process
<:minidot:923683258871472248> Is your post specific about what you want feedback on?
<:minidot:923683258871472248> Have you provide timestamps of the areas you want reviewed?
<:minidot:923683258871472248> Can you share references to what you would like to achieve?
<:minidot:923683258871472248> Example of a good title: "How can I mix my audio better at 3:20?"
<:minidot:923683258871472248> Example of a bad title: "Does this look good?"
If you need to edit your title or post, please do so now or it may be deleted`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }
}