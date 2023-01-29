const inviteSchema = require('../../schemas/misc/invite_schema');
const { dbCreate } = require('../../utils/utils');

module.exports = {
    name: 'inviteCreate',
    async execute(invite, client, Discord) {
        if (invite.guild.id === process.env.SHARE_GUILD) return;
        
        // Create a new entry in the database
        if (!invite.inviterId) return;
        await dbCreate(inviteSchema, { code: invite.code, userId: invite.inviterId, uses: invite.uses });
    }
}