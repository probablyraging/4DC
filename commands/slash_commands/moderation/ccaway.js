const { ContextMenuInteraction } = require('discord.js');
const { toggleAway, getAwayUsers } = require("../../../modules/creator_crew/utilities");
const ccVideoQueue = require('../../../schemas/creator_crew/video_queue');
const path = require('path');

module.exports = {
    name: `ccaway`,
    description: `Toggle the away staus of users for Creator Crew, or list currently away users`,
    access: 'staff',
    cooldown: 10,
    type: `CHAT_INPUT`,
    options: [
        {
            name: `toggle`,
            description: `Toggle the user's away status`,
            type: `SUB_COMMAND`,
            usage: `/ccaway toggle [username]`,
            options: [
                {
                    name: `username`,
                    description: `The user you want to add a warning to`,
                    type: `USER`,
                    required: true
                }
            ]
        },
        {
            name: `list`,
            description: `List all users who are currently away`,
            type: `SUB_COMMAND`,
            usage: `/ccaway list`
        }
    ],
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true });

        switch (options.getSubcommand()) {
            case 'toggle': {
                const target = options.getMember('username');
                let awayStatus = await toggleAway(target.id);

                if (awayStatus !== null) {
                    if (awayStatus === true) {
                        // If the user is being set as away
                        await interaction.editReply(`Away status for user ${target} was set to ${awayStatus}.`)
                            .catch(err => console.error("There was a problem replying to the interaction: ", err));
                    } else {
                        // If the user is being set as back, get all their queued video and reset the timestamps to avoid warnings
                        const getUsersQueue = await ccVideoQueue.find({ userId: target.id });
                        if (getUsersQueue.length > 0) {
                            await ccVideoQueue.updateMany({
                                userId: target.id
                            }, {
                                timestamp: new Date().valueOf()
                            }, {
                                upsert: true
                            }).catch(err => console.error("There was a problem updating a database entry: ", err));
                        }
                        await interaction.editReply(`Away status for user ${target} was set to ${awayStatus}.`)
                            .catch(err => console.error("There was a problem replying to the interaction: ", err));
                    }
                } else {
                    await interaction.editReply(`Could not set the away status for ${target}.`)
                        .catch(err => console.error("There was a problem replying to the interaction: ", err));
                }
                break;
            }
            case 'list': {
                let users = await getAwayUsers();

                if (users.length === 0) {
                    await interaction.editReply(`No users are currently set to away.`)
                        .catch(err => console.error("There was a problem replying to the interaction: ", err));
                } else {
                    let response = "Users who are currently away:";
                    users.forEach(user => {
                        let guildMember = guild.members.cache.get(user);
                        response += `\n> ${guildMember} is currently set to away.`
                    })

                    await interaction.editReply(response)
                        .catch(err => console.error("There was a problem replying to the interaction: ", err));
                }
                break;
            }
        }
    }
}