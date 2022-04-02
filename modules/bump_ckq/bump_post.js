const { Message, MessageEmbed } = require('discord.js');
const mongo = require('../../mongo');
const timerSchema = require('../../schemas/misc/timer_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message) => {
//     if (message?.channel.id === process.env.BUMP_CHAN && !message?.author.bot) {
//         let savesMessage;

//         if (message?.content === '!d bump') {

//             const myDate = new Date();
//             const addTwo = myDate.setHours(myDate.getHours() + 2);
//             const timestamp = addTwo;

//             const searchFor = 'bumpTime';

//             message?.channel.permissionOverwrites.edit(message?.guild.id, {
//                 SEND_MESSAGES: false,
//             })

//             await mongo().then(async mongoose => {
//                 await timerSchema.findOneAndUpdate({
//                     searchFor
//                 }, {
//                     timestamp,
//                     searchFor
//                 }, {
//                     upsert: true
//                 }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

//                 // add a counting save to the user
//                 const results = await countingSchema.find({ userId: message?.author.id });
//                 // if user doesn't have an entry yet
//                 if (results.length === 0) {
//                     await countingSchema.findOneAndUpdate({
//                         userId: message?.author.id,
//                         saves: 0,
//                         counts: 0
//                     }, {
//                         userId: message?.author.id,
//                         saves: 0,
//                         counts: 0
//                     }, {
//                         upsert: true
//                     }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

//                     const results = await countingSchema.find({ userId: message?.author.id });

//                     for (const data of results) {
//                         const { saves } = data;

//                         if (saves < 2) {
//                             await countingSchema.findOneAndUpdate({
//                                 userId: message?.author.id
//                             }, {
//                                 saves: saves + 1,
//                             }, {
//                                 upsert: true
//                             }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

//                             savesMessage = `You earned a save for the counting game and now have \`${saves + 1}/2\` saves`
//                         } else {
//                             savesMessage = `You already have the \`2/2\` saves for the counting game`
//                         }
//                     }
//                 } else {
//                     for (const data of results) {
//                         const { saves } = data;

//                         if (saves < 2) {
//                             await countingSchema.findOneAndUpdate({
//                                 userId: message?.author.id
//                             }, {
//                                 saves: saves + 1,
//                             }, {
//                                 upsert: true
//                             }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

//                             savesMessage = `You earned a save for the counting game and now have \`${saves + 1}/2\` saves`
//                         } else {
//                             savesMessage = `You already have the \`2/2\` saves for the counting game`
//                         }
//                     }
//                 }

//                 const bumpConfirm = new MessageEmbed()
//                     .setColor('#32BEA6')
//                     .setTitle(`THANKS FOR BUMPING!`)
//                     .setURL('https://disboard.org/server/820889004055855144')
//                     .setDescription(`Consider leaving an honest review of the server by [**CLICKING HERE**](https://disboard.org/server/820889004055855144)

// ${savesMessage}`)
//                     .setImage('https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/81z2HgQ.jpg')

//                 message?.channel.send({
//                     embeds: [bumpConfirm]
//                 }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
//             }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
//         } else {
//             message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

//             message?.channel.send({
//                 content: `${process.env.BOT_DENY} \`Unknown command. Please try '!d bump'\``
//             }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
//                 .then(msg => {
//                     setTimeout(() => msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)), 10000);
//                 });
//         }
//     } else {
//         if (message?.content === '!d bump' && !message?.member?.roles?.cache.has(process.env.STAFF_ROLE) && !message?.author.bot) {
//             message?.reply({
//                 content: `${process.env.BOT_DENY} \`You can only use this command in\` <#${process.env.BUMP_CHAN}>`,
//                 allowedMentions: { repliedUser: true },
//                 failIfNotExists: false
//             }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
//                 .then(msg => {
//                     setTimeout(() => msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)), 7000);
//                 });
//         }
//     }

    if (message?.channel.id === process.env.BUMP_CHAN && message?.content.includes('!d bump')) {
        message?.reply({
            content: `${process.env.BOT_DENY} \`Please use /bump instead\``,
            allowedMentions: { repliedUser: true },
            failIfNotExists: false
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        setTimeout(() => {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }, 600);
    }
}