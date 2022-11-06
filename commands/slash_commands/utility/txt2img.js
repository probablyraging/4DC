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

        const filter = ['naked', 'boobs', 'vagina', 'penis', 'breasts', 'nude', 'porn', 'tits', 'cock', 'dick', 'fucking', 'cunt', 'pussy', 'piss', 'shit', 'cock', 'dick', 'sex', 'anus', 'seduce', 'seductive'];

        for (let i in filter) {
            if (prompt.includes(filter[i])) {
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
                "{\"prompt\": \"apple\", \"all_prompts\": [\"apple\"], \"negative_prompt\": \"\", \"seed\": 1233474175, \"all_seeds\": [1233474175], \"subseed\": 3881526904, \"all_subseeds\": [3881526904], \"subseed_strength\": 0, \"width\": 512, \"height\": 512, \"sampler_index\": 0, \"sampler\": \"Euler a\", \"cfg_scale\": 7, \"steps\": 20, \"batch_size\": 1, \"restore_faces\": false, \"face_restoration_model\": null, \"sd_model_hash\": \"7460a6fa\", \"seed_resize_from_w\": 0, \"seed_resize_from_h\": 0, \"denoising_strength\": null, \"extra_generation_params\": {}, \"index_of_first_image\": 0, \"infotexts\": [\"apple\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1233474175, Size: 512x512, Model hash: 7460a6fa\"], \"styles\": [\"None\", \"None\"], \"job_timestamp\": \"20221105183615\", \"clip_skip\": 1}",
                "<p>apple<br>\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1233474175, Size: 512x512, Model hash: 7460a6fa</p><div class='performance'><p class='time'>Time taken: <wbr>2.85s</p><p class='vram'>Torch active/reserved: 3162/3690 MiB, <wbr>Sys VRAM: 5578/8192 MiB (68.09%)</p></div>"
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

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-image')
                    .setLabel('Report Images ONLY If They Break Server Rules')
                    .setStyle(ButtonStyle.Danger)
            );

        interaction.editReply({
            content: `**Prompt**: \`${prompt}\`
**Author**: ${member}
> Get an AI generated image by using the </txt2img:1038366383425200188> command`,
            files: [attachment],
            components: [button],
            ephemeral: false
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

    }
}