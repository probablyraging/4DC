const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client, Discord) {
        await inviteSchema.findOneAndUpdate({
            code: invite.code,
            userId: invite.inviterId,
            uses: invite.uses
        }, {
            code: invite.code,
            userId: invite.inviterId,
            uses: invite.uses
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    }
}