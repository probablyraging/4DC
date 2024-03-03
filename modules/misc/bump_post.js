import { Message, EmbedBuilder } from 'discord.js';
import { dbUpdateOne } from '../../utils/utils.js';
import timerSchema from '../../schemas/timer_schema.js';
import path from 'path';
/**
 * 
 * @param {Message} message 
 */
export default async (message, client) => {
    if (message?.channel.id === process.env.BUMP_CHAN && message?.author.id === '302050872383242240') {
        // delete the warning about regular commands
        if (message?.content.toLowerCase().includes('regular commands are being replaced')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }

        // replace disboard reply with our own embed and do counting save stuff
        if (message.embeds.length >= 1) {
            message?.channel.messages.fetch(message?.id).then(async fetched => {
                let embed = fetched?.embeds[0];

                if (embed.description.toLowerCase().includes('bump done!')) {
                    message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

                    // Add two hours to the current time
                    const myDate = new Date();
                    const timestamp = myDate.setHours(myDate.getHours() + 2);

                    message?.channel.permissionOverwrites.edit(message?.guild.id, {
                        SendMessages: false,
                    })

                    await dbUpdateOne(timerSchema, { timer: 'bump' }, { timestamp });

                    const bumpConfirm = new EmbedBuilder()
                        .setColor('#32B9FF')
                        .setDescription(`Thank you for bumping the server <@${message?.interaction?.user.id}>`)
                        .setImage(process.env.BUMP_IMG)

                    // Fetch and delete the previous bump ping message
                    await message?.channel.messages.fetch({ limit: 3 }).then(fetched => {
                        fetched.forEach(message => {
                            if (message?.content.toLowerCase().includes('the server can be bumped again')) {
                                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                            }
                        })
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));

                    // Send the confirmed bump embed
                    message?.channel.send({
                        embeds: [bumpConfirm]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                }
            });
        }
    }

    // reminder to use the new slash commands
    if (message?.channel.id === process.env.BUMP_CHAN && message?.content.toLowerCase().includes('!d bump')) {
        message?.reply({
            content: `That is an old command. Please use /bump now instead`,
            allowedMentions: { repliedUser: true },
            failIfNotExists: false
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        setTimeout(() => {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }, 600);
    }

    // delete all regular message that aren't from bots
    if (message?.channel.id === process.env.BUMP_CHAN && !message?.author.bot) {
        message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
    }
}