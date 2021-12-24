const { Message, MessageEmbed } = require('discord.js');
const mongo = require('../mongo');
const timerSchema = require('../schemas/timer-schema');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    if (message?.channel.id === process.env.BUMP_CHAN && !message?.author.bot) {

        if (message?.content === '!d bump') {

            const myDate = new Date();
            const addTwo = myDate.setHours(myDate.getHours() + 2);
            const timestamp = addTwo;

            const searchFor = 'bumpTime';
            message?.channel.permissionOverwrites.edit(message?.guild.id, {
                SEND_MESSAGES: false,
            })

            await mongo().then(async mongoose => {
                await timerSchema.findOneAndRemove({ searchFor })
                try {
                    await timerSchema.findOneAndUpdate({
                        timestamp,
                        searchFor
                    }, {
                        timestamp,
                        searchFor
                    }, {
                        upsert: true
                    }).catch(err => { return; });
                } finally {
                    return;
                }
            })

            const bumpConfirm = new MessageEmbed()
                .setColor('#32BEA6')
                .setTitle(`THANKS FOR BUMPING!`)
                .setURL('https://disboard.org/server/820889004055855144')
                .setDescription(`Consider leaving an honest review of the server by [**CLICKING HERE**](https://disboard.org/server/820889004055855144)`)
                .setImage('https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/81z2HgQ.jpg')

            message?.channel.send({ embeds: [bumpConfirm] }).catch(err => { return; });
        } else {
            message?.delete().catch(err => { return; });
            message?.channel.send(`${process.env.BOT_DENY} \`Unknown command. Please try '!d bump'\``).then(msg => { setTimeout(() => msg.delete(), 10000) }).catch(err => { return; });
        }
    }

    if (message?.channel.id === process.env.BUMP_CHAN && message?.author.id === process.env.DISBOARD_ID) {
        message?.delete().catch(err => { return; });
    }
}