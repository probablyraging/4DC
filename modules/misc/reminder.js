const { EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = async (client) => {
    setInterval(() => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const promoChan = guild.channels.cache.get(process.env.CONTENT_SHARE);

        let reminder = new EmbedBuilder()
            .setColor("#e3dd34")
            .setTitle('Friendly Reminder')
            .setDescription(`Hey, we would just like to remind you that chatting with other creators in <#820889004055855147> is a much more effective way to get eyes on your content!`)
            .setThumbnail('https://i.imgur.com/7XiWKZL.png')

        promoChan.send({ embeds: [reminder] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
    }, 7200000);
}