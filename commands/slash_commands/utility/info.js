// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { sendReplyWithMention } from '../../../utils/utils.js';

export default {
    name: 'info',
    description: 'Information regarding individual topics',
    cooldown: 3,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'topic',
        description: 'Select the topic you want to reference',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'connections', value: 'connections' },
        { name: 'report', value: 'report' },
        { name: 'xp', value: 'xp' },
        { name: 'premium', value: 'premium' },
        { name: 'contentshare', value: 'contentshare' }],
    },
    {
        name: 'username',
        description: 'The user you want to direct the information at',
        type: ApplicationCommandOptionType.User,
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { options } = interaction;
        const choice = options.getString('topic');
        const target = options.getUser('username') || interaction.member;

        const responses = new Map([
            ['connections', `### *Information for ${target}:*
> ${process.env.BOT_DOC} Linking your channels/socials to your Discord profile makes it easier for other people to find your content. To link them on PC; in the bottom left of Discord, go to **user settings :gear: > connections**. To link them on iOS and Android; in the bottom right, click on **your avatar > settings :gear: > connections > add**`],

            ['report', `### *Information for ${target}:*
> ${process.env.BOT_DOC} If you believe you have found a member that is breaking the server rules or Discord's ToS, you can report them to server staff by DMing your report to <@1214062434357088256> or by using the </report:1098000171171840007> command. You will need to provide a proof image in your report`],

            ['xp', `### *Information for ${target}:*
> ${process.env.BOT_DOC} By sending messages in the server, you will earn between 15 and 25 XP towards your rank. Unlocking new ranks grants access to various rewards. To prevent spamming, earning XP is limited to once a minute per user. You can view your current rank by using the </rank:1097681002219974731> command in the <#837945839799500850> channel`],

            ['premium', `### *Information for ${target}:*
> ${process.env.BOT_DOC} The <#${process.env.PREM_CHAN}> channel is a paid service where you can promote content that generally isn't allowed to be posted in the rest of the server. Things like Discord server invites, paid services and products and even regular social media, channels and videos. For more information DM ProbablyRaging`],

            ['contentshare', `### *Information for ${target}:*
> ${process.env.BOT_DOC} Share your content in the following locations;
> - On our official site, [Distubify](<https://distubify.xyz>), which is open for everyone to use
> - The <#859117794779987978> channel for <@&821876910253670442>
> - The <#907446635435540551> channel which is a paid method of advertising your content, services, or products`],
        ]);

        if (interaction.member.roles.cache.has(process.env.STAFF_ROLE)) {
            sendReplyWithMention(interaction, responses.get(choice));
        } else {
            sendReplyWithMention(interaction, responses.get(choice), [], [], [], true);
        }
    },
};