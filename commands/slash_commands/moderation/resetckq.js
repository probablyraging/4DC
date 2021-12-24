const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const timerSchema = require('../../../schemas/timer-schema');

module.exports = {
    name: `resetckq`,
    description: `Resets the content king/queen channel`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    usage: `/resetckq`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        const ckqChannel = guild.channels.cache.get(process.env.CKQ_CHAN);
        const ckqRole = guild.roles.cache.get(process.env.CKQ_ROLE);

        const ckqEmbed = new MessageEmbed()
            .setColor('#44eaff') // GREEN
            .setTitle(`:crown: Content King/Queen`)
            .setDescription(`**What Is It?**
Content King/Queen is a promo channel with a twist. Every 5 hours the channel will unlock allowing someone to post a single link to their content. The first person to post their content wins and the channel will be locked. Your content will be featured in this channel for 5 hours and you will also get the <@&878229140992589906> role. Once your 5 hours are up, your content will be deleted and the channel will be unlocked again ready for another round. To limit channel hogging the channel is on a 6 hour cool down.
        
**What Can I Post?**
Links to social media, youtube channels, twitch channels, videos, highlights etc are all allowed. Please don't post anything that breaks the server rules.`)

        const searchFor = 'currentTime';
        await mongo().then(async mongoose => {
            try {

                setTimeout(() => ckqChannel.bulkDelete(10).then(ckqChannel.send({ embeds: [ckqEmbed] })), 100);

                setTimeout(() => ckqRole.members.each(member => {
                    member.roles.remove(ckqRole);
                }), 200);

                setTimeout(() => ckqChannel.permissionOverwrites.edit(guild.id, {
                    SEND_MESSAGES: true,
                }), 300);

                await timerSchema.findOneAndRemove({ searchFor });

                await timerSchema.findOneAndUpdate({
                    timestamp: 'null',
                    searchFor
                }, {
                    timestamp: 'null',
                    searchFor
                }, {
                    upsert: true
                }).catch(err => { return; });

            } finally {
                return;
            }
        }).then(interaction.reply({
            content: `${[process.env.BOT_CONF]} \`#${ckqChannel.name} has been reset\``,
            ephemeral: true
        }));
    }
}