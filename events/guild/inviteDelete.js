const { dbDeleteOne } = require('../../modules/misc/database_update_handler');
const inviteSchema = require('../../schemas/misc/invite_schema');

module.exports = {
    name: 'inviteDelete',
    async execute(invite, client, Discord) {
        await dbDeleteOne(inviteSchema, { code: invite.code });
    }
}