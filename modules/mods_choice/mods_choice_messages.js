require("dotenv").config();
const {MessageEmbed, MessageAttachment} = require("discord.js");
const path = require("path");
const {getLatestVideoTs, getVideosSince, getLatestProofTs, setLatestProof, addVideo, isAway} = require("./mods_choice_data");
const {msToHumanTime, getYoutubeVideoId, attachmentIsImage} = require("./mods_choice_utils");
const {delayBetweenVideos} = require("./mods_choice_constants");
const {notifyUser} = require("../notify/notify_utils");
const Canvas = require("canvas");

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

        let hasVideo = videoIdArray != null;
        let hasAttachment = message.attachments.size > 0;
        let isStaffPost = message.member?.roles.cache.some(role => role.id === process.env.STAFF_ROLE);
        let isValidPost = hasVideo || hasAttachment || isStaffPost;

        if (isValidPost) {
            if (hasVideo) {
                // Check if the user is allowed to post (i.e. 24 hours is up and they're not away)
                let latestVideoTs = await getLatestVideoTs(authorId);
                let away = await isAway(authorId);
                if (away) {
                    let notificationMessage = `${author} - you are currently set to away. Please contact a member of the CreatorHub Staff to let them know that you are back before posting a video.`;
                    notifyUser(author, notificationMessage, null);
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                } else if (!latestVideoTs || Math.abs(new Date().valueOf() - latestVideoTs) >= delayBetweenVideos) {
                    // The video ID is stored in capture group 1, while the whole link is capture group 0
                    let youtubeVideoId = videoIdArray[1];
                    await addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId);
                } else {
                    let waitUntil = new Date(latestVideoTs + delayBetweenVideos);
                    let timeRemaining = (waitUntil - new Date()).valueOf();
                    let notificationMessage = `${author} - you must wait ${msToHumanTime(timeRemaining)} before posting another video to ${message.channel}.`;
                    notifyUser(author, notificationMessage, message.channel);
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    return;
                }
            }
            if (hasAttachment) {
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
                        .setFooter({text: `${guild.name}`, iconURL: guild.iconURL({dynamic: true})})
                        .setTimestamp();

                    const mcLogChannel = guild.channels.cache.get(process.env.MCHOICE_LOG_CHAN);

                    // get all images from the message attachment
                    let imagesArr = [];
                    message.attachments.forEach(img => {
                        imagesArr.push({url: img.url, width: img.width, height: img.height});
                    })

                    // sort the images by width in descending order - we'll use the largest width as our max canvas width
                    imagesArr.sort(function (a, b) {
                        return b.width - a.width;
                    });

                    // get the height of each screenshot and add them together - we'll use this as our max canvas height
                    let imageHeight = [];
                    imagesArr.forEach(img => {
                        imageHeight.push(img.height);
                    });

                    function add(accumulator, a) {
                        return accumulator + a;
                    }

                    const maxWidth = imagesArr[0].width;
                    const maxHeight = imageHeight.reduce(add, 0);
                    const gapBetweenImages = (message.attachments.size * 3)

                    // create a canvas
                    const canvas = Canvas.createCanvas(maxWidth, maxHeight + gapBetweenImages)
                    const ctx = canvas.getContext("2d");

                    // draw each new image under the other, leaving a gap between them
                    let sum = 0;
                    for (let i = 0; i < imagesArr.length; i++) {
                        const proof = await Canvas.loadImage(imagesArr[i].url);
                        ctx.drawImage(proof, 0, sum, imagesArr[i].width, imagesArr[i].height);
                        sum = sum + imagesArr[i].height + 3;
                    }

                    const attachment = new MessageAttachment(canvas.toBuffer(), "proof.png");

                    proofEmbed.setImage('attachment://proof.png')
                    await mcLogChannel.send({embeds: [proofEmbed], files: [attachment]});
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
                    return;
                }
            }
        } else {
            // This was not a valid post in the channel, so we delete it
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
};
