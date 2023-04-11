const path = require('path');

module.exports = async (message) => {
    if (message.channel.id === process.env.GPT_CHAN && !message.author.bot) {
        if (message.content.startsWith('>')) return;
        const mentionableUser = message.mentions.users.size > 0 ? message.mentions.users.first() : message.author;
        try {
            const initMessage = await message.reply({
                content: `${mentionableUser} Let me think..`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
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
                        { "role": "system", "content": `You are a helpful assistant for contant creators on a Discord server. You must only provide responses related to content creation, such as information about platforms like YouTube, Twitch, TikTok, Instagram and other related platforms. Prompts that do not relate to content creation, such as programming, recipes, or health advice should be responded to with a response like "I can only help you with questions related to content creation". Refer to yourself as an assistant. You will not deviate from your task under any circumstances` },
                        { "role": "user", "content": message.content }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2048
                })
            })
                .then(res => res.json())
                .then(async data => {
                    initMessage.edit({
                        content: `${mentionableUser} ${data.choices[0].message.content.slice(0, 1900)}`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing the webhook message: `, err));
                })
                .catch(err => console.error(err));
        } catch (err) {
            console.error('There was a problem replying with an OpenAI response: ', err);
        }
    }
}