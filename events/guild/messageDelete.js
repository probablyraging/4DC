const { MessageEmbed } = require('discord.js');
const { ImgurClient } = require('imgur');
const mongo = require('../../mongo');
const timerSchema = require('../../schemas/misc/timer_schema');
const messageDeleteSchema = require('../../schemas/database_logs/message_delete_schema');
const path = require('path');


module.exports = {
    name: 'messageDelete',
    async execute(message, client, Discord) {
        if (message?.author.bot) return;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const timestamp = new Date().getTime();

        let content = message?.content || ` `;
        if (message?.content.length > 1000) content = message?.content.slice(0, 1000) + '...' || ` `;

        const log = new Discord.MessageEmbed()
            .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
            .setColor("#E04F5F")
            .setDescription(`**A message was deleted**`)
            .addField("Author", `${message?.author}`, true)
            .addField("Channel", `${message?.channel}`, true)
            .addField('Message', `\`\`\`${content}\`\`\``)
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

            response.forEach(res => {
                log.setImage(res.data.link);
                attachmentToImgur = res.data.link;
            });
        }

        // Log to database for dashboard
        await mongo().then(async mongoose => {
            await messageDeleteSchema.create({
                userId: message?.author.id,
                username: message?.author.tag,
                channel: message?.channel.name,
                message: content,
                attachment: attachmentToImgur,
                timestamp: timestamp,
                type: 'Message Delete'
            });
        });

        // if a user deletes there post in CKQ before the timer is up, open the channel to be reposted in
        if (message?.channel.id === process.env.CKQ_CHAN && !message?.author.bot) {
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const ckqChannel = guild.channels.cache.get(process.env.CKQ_CHAN);
            const ckqRole = guild.roles.cache.get(process.env.CKQ_ROLE);

            const searchFor = "currentTime";

            const ckEmbed = new MessageEmbed()
                .setColor("#44eaff") // GREEN
                .setTitle(`:crown: Content Spotlight`)
                .setDescription(`**What Is It?**
Content Spotlight is a promo channel with a twist. Every 5 hours the channel will unlock allowing someone to post a single link to their content. The first person to post their content wins and the channel will be locked. Your content will be featured in this channel for 5 hours and you will also get the <@&878229140992589906> role. Once your 5 hours are up, your content will be deleted and the channel will be unlocked again ready for another round. To limit channel hogging the channel is on a 6 hour cool down.
          
**What Can I Post?**
Links to social media, youtube channels, twitch channels, videos, highlights etc are all allowed. Please don't post anything that breaks the server rules.`);

            setTimeout(() => ckqChannel.bulkDelete(10).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err))
                .then(ckqChannel.send({
                    embeds: [ckEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err))), 5000);

            setTimeout(() => ckqRole.members.each(member => {
                member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            }), 5200);

            setTimeout(() => ckqChannel.permissionOverwrites.edit(guild.id, {
                SEND_MESSAGES: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err)), 5300);

            await mongo().then(async mongoose => {
                await timerSchema.findOneAndUpdate({
                    searchFor
                }, {
                    timestamp: "null",
                    searchFor
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
        }
    }
}