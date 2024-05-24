import { dbCreate } from '../../utils/utils.js';
import inviteSchema from '../../schemas/invite_schema.js';

export default {
    name: 'inviteCreate',
    async execute(invite) {
        // Create a new entry in the database
        if (!invite.inviterId) return;
        await dbCreate(inviteSchema, { code: invite.code, userId: invite.inviterId, uses: invite.uses });
    }
};