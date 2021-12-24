const { CommandInteraction } = require('discord.js');

module.exports = {
    name: `delete`,
    description: `Delete a specific number of messages from a channel or user`,
    permission: `MANAGE_MESSAGES`,
    usage: `/delete [amount] (@username)`,
    options: [{
        name: `amount`,
        description: `Number of messages to delete`,
        type: `NUMBER`,
        required: true
    },
    {
        name: `username`,
        description: `Include a username to delete their messages only`,
        type: `USER`,
        required: false
    }],
    /**
     * 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, member, channel, options } = interaction;

        const amount = options.getNumber('amount');
        const target = options.getMember('username');

        const fetchMsg = await channel.messages.fetch();

        if (!guild.me.permissionsIn(channel).has('MANAGE_MESSAGES') || !guild.me.permissionsIn(channel).has('SEND_MESSAGES') || !guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`I do not have to proper permissions for #${channel.name}\``,
                ephemeral: true
            });
        }

        if (fetchMsg.size < 1) {
            interaction.reply({
                content: `${process.env.BOT_INFO} \`I could not find any messages from ${target.user.tag} in #${channel.name}\``,
                ephemeral: true
            });
            return;
        }

        if (amount < 1 && member.id === process.env.OWNER_ID || amount > 100 && member.id === process.env.OWNER_ID ) {
            interaction.reply({
                content: `${process.env.BOT_INFO} \`Amount must be between 1 and 100\``,
                ephemeral: true
            });
            return;
        }

        if (amount < 1 || amount > 5 && member.id !== process.env.OWNER_ID) {
            interaction.reply({
                content: `${process.env.BOT_INFO} \`Amount must be between 1 and 5\``,
                ephemeral: true
            });
            return;
        } else {
            if (!target && member.id !== process.env.OWNER_ID) {
                interaction.reply({
                    content: `${process.env.BOT_INFO} \`You must include a username\``,
                    ephemeral: true
                })
                return;
            } else {
                if (target) {
                    let i = 0;
                    const filtered = [];

                    (await fetchMsg).filter(msg => {
                        if (msg.author.id === target.id && amount > i) {
                            filtered.push(msg);
                            i++;
                        }
                    })
                    channel.bulkDelete(filtered, true).then(deleted => {
                        interaction.reply({
                            content: `${process.env.BOT_CONF} \`${deleted.size} messages from ${target.user.tag} deleted in #${channel.name}\``,
                            ephemeral: true
                        });
                    });
                } else {
                    channel.bulkDelete(amount, true).then(deleted => {
                        interaction.reply({
                            content: `${process.env.BOT_CONF} \`${deleted.size} messages deleted in #${channel.name}\``,
                            ephemeral: true
                        });
                    });
                }
            }
        }
    }
}