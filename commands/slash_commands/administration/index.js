const { ContextMenuInteraction } = require('discord.js');
const index = require('../../../lists/index');
const rules = require('../../../lists/rule-list');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    locked: true,
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
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { member, channel, client, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'welcome': {
                    channel.createWebhook(client.user.username, { avatar: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png` }).then(webhook => {
                        for (let i = 0; i < 8; i++) {
                            setTimeout(function () {
                                webhook.send(index.welcome[i])
                            }, i * 1000)
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
                case 'rules': {
                    channel.createWebhook(client.user.username, { avatar: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png` }).then(webhook => {
                        webhook.send(rules.img)
                        setTimeout(() => {
                            webhook.send(`${rules.pre}

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
> **7.** ${rules.rules[6]}`)
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
                    channel.createWebhook(client.user.username, { avatar: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png` }).then(webhook => {
                        for (let i = 0; i < 4; i++) {
                            setTimeout(function () {
                                webhook.send(index.faq[i])
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
        } catch (err) {
            console.error(err);
        }
    }
}