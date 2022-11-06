const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    name: `txt2img`,
    description: `Get an AI generated image from a text prompt`,
    cooldown: 15,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "prompt",
        description: "Get fancy with it, be specific or just try something totally crazy",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction, client) {
        // TODO: add report button to images
        const { options, member, channel } = interaction;

        await interaction.deferReply();

        const prompt = options.getString(`prompt`);

        const filter = ['naked', 'boobs', 'vagina', 'penis', 'breasts', 'nude', 'porn', 'tits', 'cock', 'dick', 'fucking', 'cunt', 'pussy', 'piss', 'shit', 'dick', 'sex', 'anus', 'seduce', 'seductive'];

        for (let i in filter) {
            const regex = new RegExp(`\\b${filter[i]}\\b`, 'gi');
            if (regex.test(prompt)) {
                return interaction.editReply({
                    content: 'Please keep your prompts SFW *(safe for work)*. Using inappropriate promps will result in timeouts or bans without warning',
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        interaction.editReply({
            content: `${member} Your image is being processed and may take up to 30 seconds to appear`,
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

        const dataJson = {
            "fn_index": 100,
            "data": [
                `${prompt}`,
                "",
                "None",
                "None",
                20,
                "Euler a",
                false,
                false,
                1,
                1,
                7,
                -1,
                -1,
                0,
                0,
                0,
                false,
                512,
                512,
                false,
                0.7,
                0,
                0,
                "None",
                false,
                false,
                false,
                null,
                "",
                "Seed",
                "",
                "Nothing",
                "",
                true,
                false,
                false,
                null,
            ],
            "session_hash": "37s89n1ekua"
        }

        const resolve = await fetch(`${process.env.SD_URL}api/predict/`, {
            headers: { "Content-Type": "application/json" },
            method: 'post',
            body: JSON.stringify(dataJson)
        });
        const data = await resolve.json();
        const imgPath = data.data[0][0].name;
        const parsePath = imgPath.replaceAll('\\', '/');

        // Fetch and send image
        const resolve2 = await fetch(`${process.env.SD_URL}file=${parsePath}`, {
            headers: { "Content-Type": "application/json" },
            method: 'get',
        });
        const data2 = await resolve2.buffer();
        const attachment = new AttachmentBuilder(data2, "test.png");

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-image')
                    .setLabel('Report This Image')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('delete-image')
                    .setLabel('Delete My Image')
                    .setStyle(ButtonStyle.Danger)
            );

        interaction.editReply({
            content: `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\`
**Author**: ${member}

Create your own AI generated image by using the </txt2img:1038366383425200188> command`,
            files: [attachment],
            components: [buttons],
            ephemeral: false
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

    }
}