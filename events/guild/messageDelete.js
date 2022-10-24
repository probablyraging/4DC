const { EmbedBuilder } = require('discord.js');
const { ImgurClient } = require('imgur');
const timerSchema = require('../../schemas/misc/timer_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const letterCurrents = require('../../schemas/letter_game/letter_currents_schema');
const countingCurrent = require('../../schemas/counting_game/counting_current_schema');
const path = require('path');

module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        if (message?.author.bot || message?.channel.id === process.env.TEST_CHAN) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.MSGLOG_CHAN);

        // Log to channel
        let content = message?.content || ` `;
        if (message?.content.length > 1000) content = message?.content.slice(0, 1000) + '...' || ` `;

        const log = new EmbedBuilder()
            .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
            .setColor("#E04F5F")
            .setDescription(`**A message was deleted**`)
            .addFields({ name: `Author`, value: `${message?.author}`, inline: true },
                { name: `Channel`, value: `${message?.channel}`, inline: true },
                { name: `Message`, value: `\`\`\`${content}\`\`\``, inline: false })
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp()

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

        // if a user deletes there post in CKQ before the timer is up, open the channel to be reposted in
        if (message?.channel.id === process.env.SPOTLIGHT_CHAN && !message?.author.bot) {
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const ckqChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
            const ckqRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

            const searchFor = "currentTime";

            const ckEmbed = new EmbedBuilder()
                .setColor("#44eaff") // GREEN
                .setTitle(`:crown: Content Spotlight`)
                .setDescription(`**What Is It?**
Every 5 hours the channel will unlock, allowing anyone to post a single link to their content to claim the channel. The channel will then be locked again, allowing that person's content to be centre of attention for the next 5 hours. The person who claims the channel will also be given the <@&878229140992589906> role to stand out in chat`);

            setTimeout(() => ckqChannel.bulkDelete(10).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err))
                .then(ckqChannel.send({
                    embeds: [ckEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err))), 5000);

            setTimeout(() => ckqRole.members.each(member => {
                member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            }), 5200);

            setTimeout(() => ckqChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err)), 5300);

            await timerSchema.updateOne({
                searchFor
            }, {
                timestamp: "null",
                searchFor
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