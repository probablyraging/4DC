require("dotenv").config();
const {MessageEmbed} = require("discord.js");
const path = require("path");
const {getLatestVideoTs, getVideosSince, getLatestProofTs, setLatestProof, addVideo} = require("./mods_choice_data");
const {msToHumanTime, getYoutubeVideoId, attachmentIsImage} = require("./mods_choice_utils");

// Delay of 24 hours between posting videos
const delayBetweenVideos = 24 * 60 * 60 * 1000;

/**
 * @param {Message} message The Discord Message that was sent
 * @param {Client} client The Discord Client
 */
module.exports = async (message, client) => {
    if (message.channel.id === process.env.MCHOICE_CHAN && !message.author.bot) {
        let content = message.content;
        let author = message.author;
        let authorId = author.id;
        let messageId = message.id;
        let timestamp = message.createdAt;
        let videoIdArray = getYoutubeVideoId(content);

        if (videoIdArray != null) {
            // Check if the user is allowed to post (i.e. 24 hours is up)
            let latestVideoTs = await getLatestVideoTs(authorId);
            if (!latestVideoTs || Math.abs(new Date().valueOf() - latestVideoTs) >= delayBetweenVideos) {
                // The video ID is stored in capture group 1, while the whole link is capture group 0
                let youtubeVideoId = videoIdArray[1];
                await addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId);
            } else {
                let waitUntil = new Date(latestVideoTs + delayBetweenVideos);
                let timeRemaining = (waitUntil - new Date()).valueOf();
                let notificationMessage = `${author} - you must wait ${msToHumanTime(timeRemaining)} before posting another video to ${message.channel}.`;
                author.send(notificationMessage)
                    .catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err);
                        message.channel.send(notificationMessage)
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a channel message: `, err));
                    });
                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        } else if (message.attachments.size > 0) {
            // Check whether all the attachments are images (people will generally just post 1 image attachment)
            let hasImage = message.attachments.every(attachmentIsImage);
            if (hasImage) {
                // Set the latest proof for the user
                let lastProof = await getLatestProofTs(authorId);
                let videosSince = await getVideosSince(lastProof);
                let videosSinceCount = new Set(videosSince).size;
                await setLatestProof(authorId, messageId, timestamp.valueOf());

                // Post a link to the image over in a hidden channel, and include how many videos this proof was for
                const guild = client.guilds.cache.get(process.env.GUILD_ID);
                let guildMember = guild.members.cache.get(authorId);
                let proofMessage;
                if (videosSinceCount === 0) {
                    proofMessage = `No videos were posted since the last screenshot. This screenshot may be a continuation of the last one.`;
                } else {
                    proofMessage = `Number of videos that should be in this screenshot: ${videosSinceCount}`;
                }

                let proofEmbed = new MessageEmbed()
                    .setColor("#ffa200")
                    .setAuthor({name: `${guildMember?.user?.tag}`, iconURL: guildMember?.displayAvatarURL({dynamic: true})})
                    .addField(`User`, `${guildMember}`, false)
                    .addField("Number of Videos", `${videosSinceCount}`, false)
                    .addField(`Proof`, `\`\`\`${proofMessage}\`\`\``, false)
                    .setImage(message.attachments.first().url)
                    .setFooter({text: `${guild.name}`, iconURL: guild.iconURL({dynamic: true})})
                    .setTimestamp();

                const mcLogChannel = guild.channels.cache.get(process.env.MCHOICE_LOG_CHAN);
                await mcLogChannel.send({embeds: [proofEmbed]});
            } else {
                // No image was found in the message, so we delete it
                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                // Notify the member
                let notificationMessage = `Your screenshot was deleted from ${message.channel} because it was not a png, jpg or gif. Please use one of those formats.`;
                message.member.send(notificationMessage)
                    .catch(err => {
                        console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err);
                        message.channel.send(notificationMessage)
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a channel message: `, err));
                    });
            }
        } else if (message.member?.roles.cache.some(role => role.id === process.env.STAFF_ROLE)) {
            // Staff is posting, which is fine
        } else {
            // This was a regular user posting a message, so we delete it
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
};
