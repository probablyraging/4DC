import axios from 'axios';

export default async (member, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Check user's profile for blocked words and report to staff if a match is found
    axios.get(`https://discord.com/api/v9/users/${member.id}/profile`, { headers: { 'authorization': process.env.SB_TOKEN } })
        .then((response) => {
            const blockedWords = ['artist', 'design', 'illustrat', 'dm', 'graphic', 'gfx', 'message', 'commission', 'professional', 'nft', 'service', 'promot', 'manag', 'market', 'edit', 'expert', 'agent', 'agency', 'freelance', 'smma'];
            let matched = false;
            const matches = {
                'Username': [],
                'Display Name': [],
                'Bio': [],
            };
            for (const i in blockedWords) {
                if (member.user.username.toLowerCase().includes(blockedWords[i])) {
                    matched = true;
                    matches['Username'].push(`\`${blockedWords[i]}\``);
                }
                if (member.displayName.toLowerCase().includes(blockedWords[i])) {
                    matched = true;
                    matches['Display Name'].push(`\`${blockedWords[i]}\``);
                }
                if (response.data.user.bio.toLowerCase().includes(blockedWords[i])) {
                    matched = true;
                    matches['Bio'].push(`\`${blockedWords[i]}\``);
                }
            }
            if (matched) {
                const reason = `Blocked word(s) found in <@${member.id}>'s profile:\n`;
                const reasonLines = [];

                // Auto moderate strong matches
                if (matches['Username'].length >= 3) {
                    return member.kick('Profile filter flag').catch(err => console.error(`There was a problem kicking a member: `, err));
                }
                if (matches['Display Name'].length >= 3) {
                    return member.kick('Profile filter flag').catch(err => console.error(`There was a problem kicking a member: `, err));
                }
                if (matches['Bio'].length >= 3) {
                    return member.kick('Profile filter flag').catch(err => console.error(`There was a problem kicking a member: `, err));
                }

                // Send alert for manual review
                if (matches['Username'].length > 0) {
                    reasonLines.push(`- **Username**: ${matches['Username'].join(', ')}`);
                }
                if (matches['Display Name'].length > 0) {
                    reasonLines.push(`- **Display Name**: ${matches['Display Name'].join(', ')}`);
                }
                if (matches['Bio'].length > 0) {
                    reasonLines.push(`- **Bio**: ${matches['Bio'].join(', ')}`);
                }

                if (reasonLines.length > 0) {
                    const finalReason = reason + reasonLines.join('\n');

                    guild.channels.cache.get(process.env.STAFF_CHAN).send({
                        content: `<@&${process.env.STAFF_ROLE}>\n${finalReason}`
                    }).catch(err => console.error(`There was a problem sending a message: `, err));
                }
            }
        })
        .catch(err => console.error(`There was a problem fetching a user profile: `, err));
}