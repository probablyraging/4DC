const mongo = require('../mongo');
const wait = require("timers/promises").setTimeout;
const inviteSchema = require('../schemas/invite-schema');
const path = require('path');

module.exports = async (client) => {
    await wait(1000);

    client.guilds.cache.forEach(async guild => {
        invitesArr = [];

        const invites = await guild.invites.fetch();

        invites.forEach(invite => {
            invitesArr.push({ code: invite.code, userId: invite.inviterId, uses: invite.uses });
        });

        for (var i = 0; i < invitesArr.length; i++) {
            const searchFor = invitesArr[i].code;
            
            await mongo().then(async mongoose => {
                try {
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
                } finally {
                    //do nothing
                }
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
        }
    });
}