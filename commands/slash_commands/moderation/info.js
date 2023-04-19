const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `info`,
    description: `Information regarding individual topics`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 3,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `topic`,
        description: `Select the topic you want to reference`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'connections', value: 'connections' },
        { name: 'report', value: 'report' },
        { name: 'xp', value: 'xp' },
        { name: 'premium', value: 'premium' },
        { name: 'contentshare', value: 'contentshare' }]
    },
    {
        name: `username`,
        description: `The user you want to direct the information at`,
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;
        const choice = options.getString('topic');
        const target = options.getUser('username');

        await interaction.deferReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const responses = new Map([
            ['connections', `### *Information for ${target}:*
> ${process.env.BOT_DOC} Linking your channels/socials to your Discord profile makes it easier for other people to find your content. To link them on PC; in the bottom left of Discord, go to **user settings :gear: > connections**. To link them on iOS and Android; in the bottom right, click on **your avatar > connections > add**`],

            ['report', `### *Information for ${target}:*
> ${process.env.BOT_DOC} If you believe you have found a member that is breaking the server rules or Discord's ToS, you can report them to server staff by using the </report:1098000171171840007> command. You will need to provide a proof image in your report`],

            ['xp', `### *Information for ${target}:*
> ${process.env.BOT_DOC} By sending messages in the server, you will earn between 15 and 25 XP towards your rank. Unlocking new ranks grants access to various rewards, which can be found in the <#1005283113775157349> channel. To prevent spamming, earning XP is limited to once a minute per user. You can view your current rank by using the </rank:1097681002219974731> command in the <#837945839799500850> channel`],

            [`premium`, `### *Information for ${target}:*
> ${process.env.BOT_DOC} The <#${process.env.PREM_CHAN}> channel is a paid service where you can promote content that generally isn't allowed to be posted in the rest of the server. Things like Discord server invites, paid services and products and even regular social media, channels and videos. For more information DM ProbablyRaging`],

            [`contentshare`, `### *Information for ${target}:*
> ${process.env.BOT_DOC} You can share your content in the <#1066873011761856522> channel, or in the <#859117794779987978> channel by becoming a __Server Booster__. We also have the <#878229815541497857> channel which is accessible by everyone`]
        ]);

        sendResponse(interaction, responses.get(choice));
    }
}