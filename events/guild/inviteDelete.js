const { dbDeleteOne } = require('../../utils/utils');
const inviteSchema = require('../../schemas/misc/invite_schema');

module.exports = {
    name: 'inviteDelete',
    async execute(invite, client, Discord) {
        if (invite.guild.id === process.env.SHARE_GUILD) return;
        
        // Delete the database entry
        await dbDeleteOne(inviteSchema, { code: invite.code });
    }
}