const { ContextMenuInteraction } = require('discord.js');
const mongo = require('../../../mongo');
const ytNotificationSchema = require('../../../schemas/yt-notification-schema');
const res = new (require("rss-parser"))();
const path = require('path');

module.exports = {
    name: `ytauto`,
    description: `Add or remove a user from the YouTube auto notification list`,
    permission: `MANAGE_MESSAGES`,
    cooldown: 3,
    type: `CHAT_INPUT`,
    options: [{
        name: `add`,
        description: `Add a user to the YouTube auto list`,
        type: `SUB_COMMAND`,
        usage: `/ytauto [@username] [ytChannelId]`,
        options: [{
            name: `username`,
            description: `The user who you would like to add`,
            type: `USER`,
            required: true
        },
        {
            name: `channelid`,
            description: `The ID of the user's YouTube channel`,
            type: `STRING`,
            required: true
        }],
    },
    {
        name: `remove`,
        description: `Remove a user from the YouTube auto list`,
        type: `SUB_COMMAND`,
        usage: `/ytauto remove [@username]`,
        options: [{
            name: `username`,
            description: `The user who you would like to remove`,
            type: `USER`,
            required: true
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    const target = options.getMember('username');
                    const channelId = options.getString('channelid');

                    try {
                        // we need to store a list of the user's current video IDs
                        const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
                        const items = resolve.items;

                        let videoIdArr = [];

                        items.forEach(item => {
                            // remove the XML markup from video IDs
                            const regex = item.id.replace('yt:video:', '');

                            videoIdArr.push(regex);
                        })

                        await mongo().then(async mongoose => {
                            await ytNotificationSchema.findOneAndUpdate({
                                userId: target.id,
                            }, {
                                userId: target.id,
                                channelId: channelId,
                                videoIds: videoIdArr
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                        interaction.reply({
                            content: `${process.env.BOT_CONF} \`${target.user.tag} with channel ID '${channelId}' had been added to the YouTube auto list\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    } catch {
                        // if the supplied channel ID is incorrect
                        interaction.reply({
                            content: `${process.env.BOT_DENY} \`An error occurred. This is most likely because the channel ID doesn't exist\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
            }

            switch (options.getSubcommand()) {
                case 'remove': {
                    const target = options.getMember('username');

                    await mongo().then(async mongoose => {
                        await ytNotificationSchema.findOneAndRemove({ userId: target.id })
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`${target.user.tag} had been removed from the YouTube auto list\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            console.error(err)
        }
    }
}