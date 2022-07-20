const inviteSchema = require('../../schemas/misc/invite_schema');
const path = require('path');

module.exports = {
    name: 'inviteDelete',
    async execute(invite, client, Discord) {
        const code = invite.code;
        await inviteSchema.findOneAndRemove({ code }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
    }
}