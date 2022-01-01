const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `info`,
    description: `Information regarding individual topics`,
    permission: `MANAGE_MESSAGES`,
    cooldown: 3,
    type: `CHAT_INPUT`,
    options: [{
        name: `review`,
        description: `Information about the review channel`,
        permission: ``,
        type: `SUB_COMMAND`,
        usage: `/info review [@username]`,
        options: [{
            name: `username`,
            description: `The user you want to direct the information at`,
            type: `USER`,
            required: true,
        }],
    },
    {
        name: `connections`,
        description: `Explains how to connect socials to Discord`,
        type: `SUB_COMMAND`,
        usage: `/info connections [@username]`,
        options: [{
            name: `username`,
            description: `The user you want to direct the information at`,
            type: `USER`,
            required: true,
        }],
    },
    {
        name: `seo`,
        description: `Provide brief information regarding SEO`,
        type: `SUB_COMMAND`,
        usage: `/info seo [@username]`,
        options: [{
            name: `username`,
            description: `The user you want to direct the information at`,
            type: `USER`,
            required: true,
        }],
    },
    {
        name: `xp`,
        description: `Explains the XP and rank system`,
        type: `SUB_COMMAND`,
        usage: `/info xp [@username]`,
        options: [{
            name: `username`,
            description: `The user you want to direct the information at`,
            type: `USER`,
            required: true,
        }],
    },
    {
        name: `premium`,
        description: `Explains the premium-ads channel`,
        type: `SUB_COMMAND`,
        usage: `/info premium [@username]`,
        options: [{
            name: `username`,
            description: `The user you want to direct the information at`,
            type: `USER`,
            required: true,
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { channel, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'review': {
                    const target = options.getMember('username');

                    interaction.reply({
                        content: `*Information for ${target}:*
> ${process.env.BOT_DOC} Please be more specific about what you are wanting us to review or give advice on. Asking things like "how's this video?" or "what do you think?" does not count as specific and your post will be deleted if not fixed`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'connections': {
                    const target = options.getMember('username');

                    interaction.reply({
                        content: `*Information for ${target}:*
> ${process.env.BOT_DOC} Linking your channels/socials to your Discord profile makes it easier for other people to find your content. To link them; in the bottom left of Discord, go to **Settings ⚙️ > Connections**`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'seo': {
                    const target = options.getMember('username');

                    interaction.reply({
                        content: `*Information for ${target}:*
> ${process.env.BOT_DOC} Search Engine Optimization(SEO) such as using good keywords, thumbnails, titles and descriptions. SEO improves your chances of YouTube and Google choosing your content to fill it's search results when someone makes search request uings keywords that you've used. Find more information in <#${process.env.RES_CHAN}> and do your own research.`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'xp': {
                    const target = options.getMember('username');

                    interaction.reply({
                        content: `*Information for ${target}:*
> ${process.env.BOT_DOC} Every minute that you're chatting in the server, you randomly gain between 15 and 25 XP that goes towards your rank. The higher you rank, the more server features you unlock, such as, less competitive promotional channels. To avoid spamming, earning XP is limited to once a minute per user. You can check your current rank by going to <#${process.env.BOT_CHAN}> and typing \`/rank\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'premium': {
                    const target = options.getMember('username');

                    interaction.reply({
                        content: `*Information for ${target}:*
> ${process.env.BOT_DOC} The #premium-ads channel is a paid service with optional extras like @everyone pings, where you can promote content that generally isn't allowed to be posted in the rest of the server. Things like Discord servers, paid services and products and even regular social media, channels and videos. For more information [click here](<https://discord.com/channels/820889004055855144/907446635435540551/907463741174587473>) or DM <@${process.env.OWNER_ID}>`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}