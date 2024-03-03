const cooldown = new Set();

export default async (message) => {
    if (message.author.bot) return;

    const { content, member, author } = message;
    const lowerCaseContent = content.toLowerCase();
    const urlRegex = /((?:https?:\/\/)|(?:www\.))[^\s]+/g;
    const hasLink = lowerCaseContent.match(urlRegex);
    const isStaff = member.roles.cache.has(process.env.STAFF_ROLE);

    if (hasLink && !isStaff) {
        try {
            if (cooldown.has(author.id)) {
                message.delete();
            } else {
                cooldown.add(author.id);
                setTimeout(() => {
                    cooldown.delete(author.id);
                }, 10000);
            }
        } catch (err) {
            console.error('There was a problem with the link_cooldown module: ', err);
        }
    }
}