const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `claim`,
    description: `Claim a super secret reward`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, member, options } = interaction;
        interaction.reply({
            content: `Aww shucks! Unfortunately all 5 of the super secret rewards have already been claimed by other people. In fact, you just missed out by *2.7 seconds*
            
||Lol, not really. You honestly thought there would be some type of reward for typing numbers into a computer? This isn't a hit TV show on ABC and you aren't a group of *lost* plane crash survivors stranded on an island with a scary black smoke cloud monster, you're a damn content creator who is most likely sitting in a computer chair in an air conditioned office! You've been trying to count to 10,000 for over a year now and only now just managed to succussfully do it, and you think that should be rewarded? HA! Honestly if I were you I'd be ashamed in the fact that it took this long. I think a room full of blindfolded chimps with typewriters and stumps for hands could have counted to 10,000 quicker. Digraceful!||

||Also another joke, you did great, you and your fellow community members accomplished something pretty spectacular together, I guess? It's probably not CV worthy, but an accomplishment nonetheless, and you did it as a team! There really isn't any reward though, so have a consolation cookie instead :cookie: Oh, I have also increased the count to 20,000 now. So, give yourself a big ol' pat on the back, and get back to counting, squirt||`,
            ephemeral: true,
            allowedMentions: {
                parse: []
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}