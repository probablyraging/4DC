const timerSchema = require("../../schemas/misc/timer_schema");
const spotlightSchema = require("../../schemas/misc/spotlight_schema");
const path = require("path");

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Draw random winner from available tickets
async function drawWinner(guild) {
    const results = await spotlightSchema.find();
    if (results.length === 0) return null;
    const draw = results[randomNum(0, results.length - 1)];
    const member = await guild.members.fetch(draw.userId);
    // If member no longer exists, try again
    if (!member) return drawWinner();
    for (const data of results) {
        // Once a winner is picked, delete all tickets
        const { userId } = data;
        await spotlightSchema.deleteOne({
            userId: userId
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a database entry: `, err));
    }
    const object = {
        member: member,
        draw: draw
    }
    return object;
}

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const spotlightChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
    const spotlightRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

    setInterval(async () => {
        const results = await timerSchema.find({ timer: 'spotlight' });

        if ((results[0]?.timestamp - new Date()) < 1) {
            // Draw random winner from available tickets
            const winner = await drawWinner(guild);
            // Delete all messages that aren't an embed
            (await spotlightChannel.messages.fetch()).forEach(message => {
                if (!message.embeds.length > 0) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            });
            // Remove the spotlight role from all users
            await spotlightRole.members.each(member => {
                member.roles.remove(spotlightRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            });
            // If no winner was able to be picked
            if (!winner) return;
            // Send the winners message as a webhook
            await spotlightChannel.createWebhook({ name: winner.member.displayName, avatar: winner.member.user.displayAvatarURL() }).then(async webhook => {
                await webhook.send({
                    content: `Today's spotlight winner is ${winner.member}

${winner.draw.message}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
            // Add the spotlight role to the winner
            await winner.member.roles.add(spotlightRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

            // Update timestamp for 24 hours
            const oneDay = 24 * 60 * 60 * 1000;
            const timestamp = new Date().valueOf() + oneDay;
            await timerSchema.updateOne({
                timer: 'spotlight'
            }, {
                timestamp: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }, 300000);
};
