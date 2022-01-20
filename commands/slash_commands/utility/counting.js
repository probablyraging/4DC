const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const countingSchema = require('../../../schemas/counting-schema');
const path = require('path');


module.exports = {
    name: `counting`,
    description: `Information about the counting game`,
    permission: ``,
    cooldown: 5,
    type: `CHAT_INPUT`,
    options: [{
        name: `save`,
        description: `Information about how to get a save`,
        type: `SUB_COMMAND`,
        usage: `/counting save`,
    },
    {
        name: `donatesave`,
        description: `Donate a personal save to the guild. 1 personal save = .25 guild saves`,
        type: `SUB_COMMAND`,
        usage: `/counting donatesave`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        await mongo().then(async mongoose => {
            try {
                switch (options.getSubcommand()) {
                    case 'save': {
                        const results = await countingSchema.find({ userId: member.id });

                        for (const data of results) {
                            const { saves } = data;

                            interaction.reply({
                                content: `You currently have \`${saves}/2\` saves for the counting game

To earn more saves you must bump the server
The server can be bumped once every 2 hours, by anyone
You can bump the server by going to <#${process.env.BUMP_CHAN}> and typing \`!d bump\` when it is ready to be bumped

To be notified when the server is ready to be bumped again, you can get the <@&${process.env.BUMP_ROLE}> role from <#${process.env.SELFROLE_CHAN}>`,
                                ephemeral: true
                            })

                        }
                    }
                }

                switch (options.getSubcommand()) {
                    case 'donatesave': {
                        // TODO : add 0.25 saves to guild and remove 1 personal save from user





                    }

                }






            }
            catch { }
        }) // catch mongo
    }
}
