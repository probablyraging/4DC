const emojis = require('../../lists/role-emojis');
const path = require('path');

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        const member = guild.members.cache.find(member => member.id === user.id);

        if (reaction.emoji.name === 'twitch') roleId = emojis.twitch;
        if (reaction.emoji.name === 'youtube') roleId = emojis.youtube;
        if (reaction.emoji.name === 'instagram') roleId = emojis.instagram;
        if (reaction.emoji.name === 'tiktok') roleId = emojis.tiktok;
        if (reaction.emoji.name === '📢') roleId = emojis.r;
        if (reaction.emoji.name === '🎲') roleId = emojis.s;
        if (reaction.emoji.name === '📣') roleId = emojis.t;
        if (reaction.emoji.name === '🔵') roleId = emojis.a;
        if (reaction.emoji.name === '🔴') roleId = emojis.b;
        if (reaction.emoji.name === '🟢') roleId = emojis.c;
        if (reaction.emoji.name === '🟠') roleId = emojis.d;
        if (reaction.emoji.name === '🟡') roleId = emojis.e;
        if (reaction.emoji.name === '🌸') roleId = emojis.f;
        if (reaction.emoji.name === '🟣') roleId = emojis.g;
        if (reaction.emoji.name === '👶') roleId = emojis.h;
        if (reaction.emoji.name === '👦') roleId = emojis.i;
        if (reaction.emoji.name === '👨') roleId = emojis.j;
        if (reaction.emoji.name === '1️⃣') roleId = emojis.k;
        if (reaction.emoji.name === '2️⃣') roleId = emojis.l;
        if (reaction.emoji.name === '3️⃣') roleId = emojis.m;
        if (reaction.emoji.name === '4️⃣') roleId = emojis.n;
        if (reaction.emoji.name === '🙋‍♂️') roleId = emojis.o;
        if (reaction.emoji.name === '🙋‍♀️') roleId = emojis.p;
        if (reaction.emoji.name === '🙋') roleId = emojis.q;

        const role = guild.roles.cache.find(role => role.id === roleId);

        if (reaction.message.channel.id === process.env.SELFROLE_CHAN) {
            for (const i in emojis.names) {
                if (reaction.emoji.name === emojis.names[i]) {
                    member.roles.remove(role);
                }
            }
        } else {
            return;
        }
    }
}