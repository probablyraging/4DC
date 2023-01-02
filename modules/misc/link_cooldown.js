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
        if (cooldown.has(author.id)) {
            message.delete().catch(() => {
                // An error here is likely due to spam.js having already deleted the message
            });
        } else {
            cooldown.add(author.id);
            setTimeout(() => {
                cooldown.delete(author.id);
            }, 30000);
        }
    }
};
