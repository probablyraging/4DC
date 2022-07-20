const wait = require("timers/promises").setTimeout;
const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // wait for the client to fully initialize
    await wait(1000);

    invitesArr = [];

    // fetcth all server invited and their data and add them to our database
    const invites = await guild.invites.fetch();

    invites.forEach(invite => {
        invitesArr.push({ code: invite.code, userId: invite.inviterId, uses: invite.uses });
    });

    for (var i = 0; i < invitesArr.length; i++) {
        const searchFor = invitesArr[i].code;

        await inviteSchema.findOneAndRemove({ code: searchFor }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));

        await inviteSchema.findOneAndUpdate({
            code: invitesArr[i].code,
            userId: invitesArr[i].userId,
            uses: invitesArr[i].uses
        }, {
            code: invitesArr[i].code,
            userId: invitesArr[i].userId,
            uses: invitesArr[i].uses
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    }
}