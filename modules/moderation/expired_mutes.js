import { EmbedBuilder } from 'discord.js';
import { dbDeleteOne } from '../../utils/utils.js';
import muteSchema from '../../schemas/mute_schema.js';
import { v4 as uuidv4 } from 'uuid';

export default async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    setInterval(async () => {
        // Fetch all currently muted users from the database
        const results = await muteSchema.find().catch(err => { return console.error('There was a problem finding a database entry: ', err); });

        for (const data of results) {
            const { timestamp, userId, channelId } = data;

            if (timestamp !== 'null' && new Date() > timestamp) {
                // if the timestamp has expired, delete the database entry and remove the mute
                await dbDeleteOne(muteSchema, { userId });

                const target = client.users.cache.get(userId);
                const targetChan = guild.channels.cache.get(channelId);
                // Update the user's permissions to allow them to send messages again
                targetChan.permissionOverwrites.edit(target.id, {
                    SendMessages: null,
                }).catch(err => { return console.error('There was a problem editing a channel\'s permissions: ', err); });

                // Log to channel
                const log = new EmbedBuilder()
                    .setColor('#4fe059')
                    .setAuthor({ name: `${client?.user.username}`, iconURL: client?.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Member:** ${target?.username} *(${target?.id})*
**Channel:** ${targetChan}`)
                    .setFooter({ text: `Channel Unmute • ${uuidv4()}`, iconURL: process.env.LOG_UNMUTE })
                    .setTimestamp();

                logChan.send({
                    embeds: [log],
                }).catch(err => console.error('There was a problem sending an embed: ', err));
            }
        }
    }, 300000);
};