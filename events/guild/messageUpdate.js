import { codeBlock } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client, Discord) {
        if (oldMessage?.author?.bot || oldMessage?.author.id === process.env.OWNER_ID) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.MSGLOG_CHAN);
        // Trim the content if they exceed the character limit
        const original = oldMessage?.content?.slice(0, 1000) + (oldMessage?.content?.length > 1000 ? '...' : '');
        const edited = newMessage?.content?.slice(0, 1000) + (newMessage?.content?.length > 1000 ? '...' : '');

        if (oldMessage?.cleanContent !== newMessage?.cleanContent) {
            const log = new Discord.EmbedBuilder()
                .setColor('#FF9E00')
                .setAuthor({ name: `${oldMessage?.author?.username}`, iconURL: oldMessage?.author?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${newMessage?.url})`)
                .addFields({ name: 'Author', value: `${oldMessage?.author}`, inline: true },
                    { name: 'Channel', value: `${oldMessage?.channel}`, inline: true },
                    { name: 'Old Message', value: codeBlock(original), inline: false },
                    { name: 'New Message', value: codeBlock(edited), inline: false })
                .setFooter({ text: `Edit • ${uuidv4()}`, iconURL: process.env.LOG_EDIT })
                .setTimestamp();

            logChan.send({
                embeds: [log],
            }).catch(err => console.error('There was a problem sending an embed: ', err));
        }
    },
};