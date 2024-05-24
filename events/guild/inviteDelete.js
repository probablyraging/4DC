import { dbDeleteOne } from '../../utils/utils.js';
import inviteSchema from '../../schemas/invite_schema.js';

export default {
    name: 'inviteDelete',
    async execute(invite) {
        // Delete the database entry
        await dbDeleteOne(inviteSchema, { code: invite.code });
    }
};