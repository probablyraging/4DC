import inviteTracker from '../../modules/misc/invite_tracker.js';
import previousMutesCheck from '../../modules/moderation/previous_mutes.js';
import profileFilter from '../../modules/moderation/profile_filter.js';

export default {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        // Invite tracker
        inviteTracker(member, client);

        // Log to channel
        joinLeaveChan.send({
            content: `${process.env.BOT_JOIN} ${member} joined. There are now **${guild.memberCount}** members in the server`,
            allowedMentions: { parse: [] }
        }).catch(err => console.error('There was a problem sending a message: ', err));

        // TEMPORARY: Kick users with account age <1 month
        const oneMonth = 24 * 30 * 60 * 60 * 1000;
        if ((new Date() - member.user.createdTimestamp) < oneMonth) {
            member.send({
                content: '## Unable To Join Server \n> Your account must be **__older than one month__** before you can join ContentCreator. \n> Feel free to join again once your account meets these requirements. \n\n*Distubify Server Staff*'
            }).catch(() => { });
            member.kick('Account age less than 1 month').catch(err => console.error('There was a problem kicking a user from the server: ', err));
            return;
        }

        // Check if the user was muted, and left the server while a mute was active
        previousMutesCheck(member, client);

        // Check user's profile for blocked words and report to staff if a match is found
        profileFilter(member, client);
    }
};