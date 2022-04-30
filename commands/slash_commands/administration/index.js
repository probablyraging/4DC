const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const index = require('../../../lists/index');
const rules = require('../../../lists/rule-list');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    cooldown: 0,
    type: `CHAT_INPUT`,
    options: [{
        name: `welcome`,
        description: `Pre-written content for the welcome channel`,
        type: `SUB_COMMAND`,
        usage: `/index welcome`,
    },
    {
        name: `rules`,
        description: `Pre-written content for the rules channel`,
        type: `SUB_COMMAND`,
        usage: `/index rules`,
    },
    {
        name: `faq`,
        description: `Pre-written content for the faq channel`,
        type: `SUB_COMMAND`,
        usage: `/index faq`,
    },
    {
        name: `modschoice`,
        description: `Pre-written content for the modschoice channel`,
        type: `SUB_COMMAND`,
        usage: `/index modschoice`,
    },
    {
        name: `selfroles`,
        description: `Embeds for the self roles channel`,
        type: `SUB_COMMAND`,
        usage: `/index selfroles`,
    },
    {
        name: `yttogether`,
        description: `Embeds for the YouTube Together channel`,
        type: `SUB_COMMAND`,
        usage: `/index yttogether`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { message, channel, client, options } = interaction;

        const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

        try {
            switch (options.getSubcommand()) {
                case 'welcome': {
                    channel.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
                        webhook.send(index.welcome[0])
                            .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        setTimeout(() => {
                            webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                        }, 10000);
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
                }

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            switch (options.getSubcommand()) {
                case 'rules': {
                    channel.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
                        setTimeout(() => {
                            webhook.send(`**SERVER RULES**
${rules.pre}

> **1.** ${rules.rules[0]}
> 
> **2.** ${rules.rules[1]}
> 
> **3.** ${rules.rules[2]}
> 
> **4.** ${rules.rules[3]}
> 
> **5.** ${rules.rules[4]}
> 
> **6.** ${rules.rules[5]}
> 
> **7.** ${rules.rules[6]}

${rules.rules[7]}`).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, 1000);
                        setTimeout(() => {
                            webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                        }, 10000);
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
                }

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            switch (options.getSubcommand()) {
                case 'faq': {
                    channel.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
                        for (let i = 0; i < index.faq.length; i++) {
                            setTimeout(function () {
                                webhook.send({
                                    content: `${index.faq[i]}`,
                                    allowedMentions: {
                                        parse: []
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                            }, i * 1000);
                        }
                        setTimeout(() => {
                            webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                        }, 10000);
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
                }

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            switch (options.getSubcommand()) {
                case 'modschoice': {

                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setDescription(`${index.modschoice}`)

                    channel.send({
                        embeds: [response]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'selfroles': {
                    interaction.deferReply({ ephemeral: true });

                    const response1 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Nickname Colors\`**`)
                        .setDescription(`Click a reaction below to change your nickname color`)

                    const response2 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Choose Your Platforms\`**`)
                        .setDescription(`<:twitch:837083090283003964> - Twitch
<:youtube:837083090441994240> - YouTube
<:instagram:837325424744595466> - Instagram
<:tiktok:837325423712796762> - TikTok`)

                    const response3 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Choose Your Age\`**`)
                        .setDescription(`:baby: - 13-17
:boy: - 18-29
:man: - 30+`)

                    const response4 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Choose Your Region\`**`)
                        .setDescription(`:one: - America
:two: - Europe
:three: - Oceania
:four: - Asia`)

                    const response5 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Choose Your Gender\`**`)
                        .setDescription(`:man_raising_hand: - Male
:woman_raising_hand: - Female
:person_raising_hand: - Non-binary`)

                    const response6 = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`**\`Optional Ping Roles\`**`)
                        .setDescription(`:loudspeaker: - Announcements | *giveaways, new channels etc*
:game_die: - Game Deals | *bot ping for <#846449072105586708>*
:mega: - Disboard Bump | *bot ping for <#855427926136193054>*`)

                    const res1 = await channel.send({ embeds: [response1] }).catch(err => console.error(`Could not send a message: `, err));
                    await res1.react("🔵").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🔴").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🟢").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🟠").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🟡").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🟣").catch(err => console.error(`Could not react to message: `, err));
                    await res1.react("🌸").catch(err => console.error(`Could not react to message: `, err));

                    const res2 = await channel.send({ content: '⠀', embeds: [response2] }).catch(err => console.error(`Could not send a message: `, err));
                    await res2.react("<:twitch:837083090283003964>").catch(err => console.error(`Could not react to message: `, err));
                    await res2.react("<:youtube:837083090441994240>").catch(err => console.error(`Could not react to message: `, err));
                    await res2.react("<:instagram:837325424744595466>").catch(err => console.error(`Could not react to message: `, err));
                    await res2.react("<:tiktok:837325423712796762>").catch(err => console.error(`Could not react to message: `, err));

                    const res3 = await channel.send({ content: '⠀', embeds: [response3] }).catch(err => console.error(`Could not send a message: `, err));
                    await res3.react("👶").catch(err => console.error(`Could not react to message: `, err));
                    await res3.react("👦").catch(err => console.error(`Could not react to message: `, err));
                    await res3.react("👨").catch(err => console.error(`Could not react to message: `, err));

                    const res4 = await channel.send({ content: '⠀', embeds: [response4] }).catch(err => console.error(`Could not send a message: `, err));
                    await res4.react("1️⃣").catch(err => console.error(`Could not react to message: `, err));
                    await res4.react("2️⃣").catch(err => console.error(`Could not react to message: `, err));
                    await res4.react("3️⃣").catch(err => console.error(`Could not react to message: `, err));
                    await res4.react("4️⃣").catch(err => console.error(`Could not react to message: `, err));

                    const res5 = await channel.send({ content: '⠀', embeds: [response5] }).catch(err => console.error(`Could not send a message: `, err));
                    await res5.react("🙋‍♂️").catch(err => console.error(`Could not react to message: `, err));
                    await res5.react("🙋‍♀️").catch(err => console.error(`Could not react to message: `, err));
                    await res5.react("🙋").catch(err => console.error(`Could not react to message: `, err));

                    const res6 = await channel.send({ content: '⠀', embeds: [response6] }).catch(err => console.error(`Could not send a message: `, err));
                    await res6.react("📢").catch(err => console.error(`Could not react to message: `, err));
                    await res6.react("🎲").catch(err => console.error(`Could not react to message: `, err));
                    await res6.react("📣").catch(err => console.error(`Could not react to message: `, err));

                    interaction.editReply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}