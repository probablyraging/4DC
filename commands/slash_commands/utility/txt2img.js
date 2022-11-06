const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Buffer } = require('node:buffer');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
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
    async execute(interaction) {
        const { options, member, channel } = interaction;
        const prompt = options.getString(`prompt`);

        await interaction.deferReply();

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

        // Connect to SD websocket
        var ws = new WebSocket('wss://runwayml-stable-diffusion-v1-5.hf.space/queue/join');
        ws.on('open', function () {
            const body = { session_hash: "xhx1zj7bng", fn_index: 1 };
            ws.send(JSON.stringify(body));
        });

        ws.on('message', async function message(data) {
            if (data.includes('send_data')) {
                const body = { "fn_index": 1, "data": [`${prompt}`], "session_hash": "xhx1zj7bng" };
                ws.send(JSON.stringify(body));
            }

            if (data.includes('process_completed')) {
                const jsonData = JSON.parse(data.toString());
                const imageRaw = jsonData.output.data[0][0];
                const image = imageRaw.replace(/(\r\n|\n|\r)/gm, '');
                const buf = Buffer.from(image.split(",")[1], 'base64');
                const cleanPrompt = prompt.slice(0, 36).replace(/[^\w\s]/gi, '')
                const fileName = cleanPrompt.replace(/\s/g, '_')
                const attachment = new AttachmentBuilder(buf, { name: `${fileName}_${new Date()}.png` });

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

Create your own AI generated image with the </txt2img:1038366383425200188> command`,
                    files: [attachment],
                    components: [buttons]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        });
    }
}