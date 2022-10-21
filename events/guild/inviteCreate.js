const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client, Discord) {
        await inviteSchema.create({
            code: invite.code,
            userId: invite.inviterId,
            uses: invite.uses
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
    }
}