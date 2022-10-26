const { Message } = require('discord.js');
const cooldown = new Set();

module.exports = async (message) => {
    const author = message?.author;
    const content = message?.content.toLocaleLowerCase();
    const conditions = ['https://', 'http://', 'www.'];
    const check = conditions.some(el => content.includes(el));

    if (!author) return;
    if (check && !message?.member?.permissions.has("ManageMessages") && !message?.member?.roles.cache.has(process.env.RANK5_ROLE) && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE) && !message?.author?.bot) {
        if (cooldown.has(message?.author?.id)) {
            message?.delete().catch(() => { });
        } else {
            cooldown.add(message?.author.id)
            setTimeout(() => {
                cooldown.delete(message?.author.id)
            }, 30000);
        }
    }
}