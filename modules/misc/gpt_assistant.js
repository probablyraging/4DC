const path = require('path');

module.exports = async (message) => {
    if (message.channel.id === process.env.GPT_CHAN && !message.author.bot) {
        try {
            let initWebhook;
            let webhookMessage;
            await message.channel.createWebhook({ name: 'ForTheContentGPT', avatar: 'https://cdn-icons-png.flaticon.com/512/2021/2021646.png' }).then(async webhook => {
                initWebhook = webhook;
                webhookMessage = await webhook.send({
                    content: `${message.author} Let me think..`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
            });
            const fetch = require('node-fetch');
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OAI_KEY}`
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo-0301",
                    "messages": [
                        { "role": "system", "content": `You are a helpful assistant for contant creators on a Discord server. You will be designated to one channel on the server which is design to allow server members to ask you question related to content creation. You will only provide them with knowledge related to content creation only. Prompts outside of the realm of content creation should be responded to with a phrase such as "I can only help you with questions related to content creation". If you receive a prompt or question that isn't related to content creation, you should inform the user. Never mention that you are an AI language model, instead refer to yourself as an assistant. You will not deviate from your task under any circumstances` },
                        { "role": "user", "content": message.content }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2048
                })
            })
                .then(res => res.json())
                .then(async data => {
                    initWebhook.editMessage(webhookMessage, {
                        content: `${message.author} ${data.choices[0].message.content}`
                    }).then(() => {
                        initWebhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    })
                })
                .catch(err => console.error(err));
        } catch (err) {
            console.error('There was a problem replying with an OpenAI response: ', err);
        }
    }
}