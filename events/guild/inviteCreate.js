const inviteSchema = require('../../schemas/invite_schema');
const { dbCreate } = require('../../utils/utils');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client, Discord) {
        // Create a new entry in the database
        if (!invite.inviterId) return;
        await dbCreate(inviteSchema, { code: invite.code, userId: invite.inviterId, uses: invite.uses });
    }
}