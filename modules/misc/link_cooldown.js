const cooldown = new Set();

module.exports = async (message) => {
    if (message.author.bot) return;

    const { content, member, author } = message;
    const lowerCaseContent = content.toLowerCase();
    const hasHttpLink = lowerCaseContent.includes('https://') || lowerCaseContent.includes('http://');
    const hasWWWLink = lowerCaseContent.includes('www.');
    const hasLink = hasHttpLink || hasWWWLink;
    const hasManageMessagesPermission = member.permissions.has('ManageMessages');
    const hasRank5Role = member.roles.cache.has(process.env.RANK5_ROLE);
    const hasVerifiedRole = member.roles.cache.has(process.env.VERIFIED_ROLE);
    const hasPermission = hasManageMessagesPermission || hasRank5Role || hasVerifiedRole;

    if (hasLink && !hasPermission) {
        try {
            if (cooldown.has(author.id)) {
                message.delete();
            } else {
                cooldown.add(author.id);
                setTimeout(() => {
                    cooldown.delete(author.id);
                }, 30000);
            }
        } catch (err) {
            console.error('There was a problem with the link_cooldown module: ', err);
        }
    }
}