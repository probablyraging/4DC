const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { ImgurClient } = require('imgur');
const timerSchema = require('../../schemas/misc/timer_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const letterCurrents = require('../../schemas/letter_game/letter_currents_schema');
const countingCurrent = require('../../schemas/counting_game/counting_current_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

function get64bin(int) {
    if (int >= 0) {
        return int.toString(2).padStart(64, "0");
    } else {
        return (-int - 1).toString(2).replace(/[01]/g, d => +!+d).padStart(64, "1");
    }
}

module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        if (message?.author.bot || message?.channel.id === process.env.TEST_CHAN) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.MSGLOG_CHAN);

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });

            const entry = fetchedLogs.entries.first();
            const binary = get64bin(parseInt(entry.id)).slice(0, 42);
            const decimalEpoch = parseInt(binary, 2) + 1420070400000;
            const timestamp = Date.parse(new Date(decimalEpoch));

            // Log to channel
            let content = message?.content || ` `;
            if (message?.content.length > 1000) content = message?.content.slice(0, 1000) + '...' || ` `;

            const log = new EmbedBuilder()
                .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
                .setColor("#E04F5F")
                .addFields({ name: `Author`, value: `${message?.author}`, inline: true },
                    { name: `Channel`, value: `${message?.channel}`, inline: true },
                    { name: `Message`, value: `\`\`\`${content}\`\`\``, inline: false })
                .setFooter({ text: `Delete • ${uuidv4()}`, iconURL: 'https://i.imgur.com/WCGpf7d.png' })
                .setTimestamp()

            if ((new Date() - timestamp) < 10000) {
                const executor = await guild.members.fetch(entry.executor.id);
                log.setAuthor({ name: `${executor?.user.tag}`, iconURL: executor?.user.displayAvatarURL({ dynamic: true }) })
            }

            let msgAttachment = message?.attachments.size > 0 ? message?.attachments.first().url : null;

            if (msgAttachment) {
                // create a new imgur client
                const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

                // upload attachment to imgur, get the link and attach it to the embed
                const response = await imgur.upload({
                    image: msgAttachment,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

                if (response.length > 0) {
                    if (response[0].status !== 200) return;
                    log.setImage(response[0].data.link);
                }
            }

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }, 2000);

        // if a user deletes there post in CKQ before the timer is up, open the channel to be reposted in
        if (message?.channel.id === process.env.SPOTLIGHT_CHAN && !message?.author.bot) {
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const ckqChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
            const ckqRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

            (await ckqChannel.messages.fetch()).forEach(message => {
                if (!message.author.bot) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            });

            message?.member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            ckqChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

            await timerSchema.updateOne({
                timer: 'spotlight'
            }, {
                timestamp: "null",
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }

        // If a user deletes their count in the counting game, send the current number
        if (message?.channel.id === process.env.COUNT_CHAN && !message.author.bot) {
            // Check if message contained a number, and do some other checks to prevent false flags
            const containsNumbers = /\d/.test(message?.content);
            if (!containsNumbers) return;
            const results = await countingSchema.find({ userId: message?.author?.id });
            let currentSaves = 0;
            for (const data of results) {
                currentSaves = data.saves;
            }
            if ((currentSaves > 0 || message?.member?.roles.cache.has(process.env.RANK5_ROLE) || message?.member?.roles.cache.has(process.env.VERIFIED_ROLE))) {
                // Fetch the current count from the database
                const results = await countingCurrent.find({ searchFor: 'currentCount' });
                for (const data of results) {
                    message?.channel.send({
                        content: `${process.env.BOT_INFO} ${message.author}'s message was edited or deleted
The current count is \`${data.currentCount}\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }
        }

        // If a user deletes their word in the letter game, send the current word and letter
        if (message?.channel.id === process.env.LL_CHAN && !message.author.bot) {
            const results = await letterCurrents.find();
            for (const data of results) {
                if (message?.content.toLowerCase() === data.previousWord) {
                    message?.channel.send({
                        content: `${process.env.BOT_INFO} ${message.author}'s message was edited or deleted
Their word was \`${data.previousWord.toUpperCase()}\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }
        }
    }
}