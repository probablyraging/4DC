const inviteSchema = require('../../schemas/misc/invite_schema');
const { dbCreate } = require('../../modules/misc/database_update_handler');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client, Discord) {
        if (!invite.inviterId) return;
        await dbCreate(inviteSchema, { code: invite.code, userId: invite.inviterId, uses: invite.uses });
    }
}