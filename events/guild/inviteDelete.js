const { dbDeleteOne } = require('../../utils/utils');
const inviteSchema = require('../../schemas/misc/invite_schema');

module.exports = {
    name: 'inviteDelete',
    async execute(invite, client, Discord) {
        // Delete the database entry
        await dbDeleteOne(inviteSchema, { code: invite.code });
    }
}