const { EmbedBuilder } = require('discord.js');
const cronjob = require('cron').CronJob;
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const promoChan = guild.channels.cache.get(process.env.CONTENT_SHARE);
    const twoHors = 2 * 60 * 60 * 1000;

    let reminder = new EmbedBuilder()
        .setColor("#e3dd34")
        .setTitle('Friendly Reminder')
        .setURL('https://discord.com/channels/820889004055855144/820889004055855147')
        .setDescription(`Hey, we would just like to remind you that chatting with other creators in <#820889004055855147> is a much more effective way to get eyes on your content!`)
        .setThumbnail('https://i.imgur.com/7XiWKZL.png')

    // On ready, check for previous reminder message, delete and repost if older than 2 hours
    setTimeout(async () => {
        let found = false;
        await promoChan.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(async message => {
                if (message.author.id === client.user.id) {
                    if (message.embeds.length > 0 && message.embeds[0].data.title.toLowerCase() === 'friendly reminder') {
                        found = true;
                        if (found && new Date() - message.createdTimestamp > twoHors) {
                            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                            promoChan.send({ embeds: [reminder] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));

        if (!found) {
            promoChan.send({ embeds: [reminder] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }, 300000);

    // Periodically check if we need to resend the reminder
    const reminderJob = new cronjob('0 */2 * * *', async function () {
        found = false;
        await promoChan.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(async message => {
                if (message.author.id === client.user.id) {
                    if (message.embeds.length > 0 && message.embeds[0].data.title.toLowerCase() === 'friendly reminder') {
                        found = true;
                        if (new Date() - message.createdTimestamp > twoHors) {
                            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                            promoChan.send({ embeds: [reminder] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));

        if (!found) {
            promoChan.send({ embeds: [reminder] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    });
    
    reminderJob.start();
}