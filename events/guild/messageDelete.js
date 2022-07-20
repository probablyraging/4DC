const { EmbedBuilder } = require('discord.js');
const { ImgurClient } = require('imgur');
const timerSchema = require('../../schemas/misc/timer_schema');
const messageDeleteSchema = require('../../schemas/database_logs/message_delete_schema');
const path = require('path');

module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        if (message?.author.bot) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.MSGUP_CHAN);
        const timestamp = new Date().getTime();

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
        let attachmentToImgur;

        if (msgAttachment) {
            // create a new imgur client
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            // upload attachment to imgur, get the link and attach it to the embed
            const response = await imgur.upload({
                image: msgAttachment,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            if (response.status === 200) {
                response.forEach(res => {
                    console.log(res.data.length)
                    log.setImage(res.data.link);
                    attachmentToImgur = res.data.link;
                });
            }
        }

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        // Log to database for dashboard
        await messageDeleteSchema.create({
            userId: message?.author.id,
            username: message?.author.tag,
            channel: message?.channel.name,
            message: content,
            attachment: attachmentToImgur,
            timestamp: timestamp,
            type: 'Message Delete'
        });

        // if a user deletes there post in CKQ before the timer is up, open the channel to be reposted in
        if (message?.channel.id === process.env.CKQ_CHAN && !message?.author.bot) {
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const ckqChannel = guild.channels.cache.get(process.env.CKQ_CHAN);
            const ckqRole = guild.roles.cache.get(process.env.CKQ_ROLE);

            const searchFor = "currentTime";

            const ckEmbed = new EmbedBuilder()
                .setColor("#44eaff") // GREEN
                .setTitle(`:crown: Content Spotlight`)
                .setDescription(`**What Is It?**
Every 5 hours the channel will unlock, allowing everyone to post a single link to their content, the person who claims the channel will also be given the <@&878229140992589906> role. The channel will then be locked again for 5 hours allowing that person's content to be centre of attention`);

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

            await timerSchema.findOneAndUpdate({
                searchFor
            }, {
                timestamp: "null",
                searchFor
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }
}