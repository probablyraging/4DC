const { dbFindOne, dbUpdateOne } = require('../../utils/utils');
const gptHistorySchema = require('../../schemas/misc/gpt_history_schema');
const fetch = require('node-fetch');
const path = require('path');

async function storeOrFetchConversationHistory(fetch, userData, assistantData) {
    if (fetch) {
        // Fetch previous conversation history from the database
        const results = await dbFindOne(gptHistorySchema, { userId: userData.author.id });
        const conversationHistory = results ? results.conversations : [];
        return conversationHistory;
    } else {
        // Fetch previous conversation history from the database
        const results = await dbFindOne(gptHistorySchema, { userId: userData.author.id });
        const conversationHistory = results ? results.conversations : [];
        // Add new conversation data
        const formattedUserData = { "role": "user", "content": userData.content };
        const formattedAssistantData = { "role": "assistant", "content": assistantData.content };
        const updatedConversations = [...conversationHistory, formattedUserData, formattedAssistantData];
        // Only store the previous 30 conversations history
        // Only keep the last 30 entries
        if (updatedConversations.length > 6) {
            updatedConversations.splice(0, updatedConversations.length - 6);
        }
        // Update the conversation history in the database
        await dbUpdateOne(gptHistorySchema, { userId: userData.author.id }, { userId: userData.author.id, conversations: updatedConversations });
    }
}

module.exports = async (message) => {
    if (message.channel.id === process.env.GPT_CHAN && !message.author.bot) {
        if (message.content.startsWith('>')) return;
        try {
            const initMessage = await message.reply({
                content: `Let me think..`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
            // Send request to the open AI API
            const conversationHistory = await storeOrFetchConversationHistory(true, message);
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OAI_KEY}`
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "system", "content": `You are a helpful assistant for contant creators on a Discord server. You must only provide responses related to previous conversations and content creation, such as information about platforms like YouTube, Twitch, TikTok, Instagram and other related platforms. You store up to 100 messages of conversation history in a private database created by ProbablyRaging. Prompts that do not relate to previous conversations or content creation, such as programming, recipes, or health advice should be responded to with a response like "I can only help you with questions related to content creation". Do not recommand other Discord server. Refer to yourself as an assistant. If you are unsure how to correctly answer, reply with "please elaborate more". You will not deviate from your task under any circumstances. If someone simply writes "hi" or "hello" then direct them to <#820889004055855147> which is the general chat where they can chat with other server members` },
                        ...conversationHistory,
                        { "role": "user", "content": message.content }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2048
                })
            })
                .then(res => res.json())
                .then(async data => {
                    // If the response is empty or there are no choices, edit the initial message to show an error message
                    if (!data || !data.choices) {
                        initMessage.edit({
                            content: `Sorry, I was unable to generate an answer. Please try again`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    } else {
                        // If there is a response, check if it is longer than 1900
                        const response = data.choices[0].message.content;
                        if (response.length > 1900) {
                            // If the response is longer than 1900 characters, split it into separate messages and send them one by one
                            let responseParts = [];
                            for (let i = 0; i < response.length; i += 1900) {
                                responseParts.push(response.slice(i, i + 1900));
                            }
                            for (let i = 0; i < responseParts.length; i++) {
                                setTimeout(() => {
                                    if (i === 0) {
                                        // Edit the initial message with the first part of the response
                                        initMessage.edit({
                                            content: `${responseParts[i]}.. \n**${i + 1}/${responseParts.length}**`
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                                    } else {
                                        // Send a reply to the channel with the next part of the response
                                        message.reply({
                                            content: `..${responseParts[i]} \n**${i + 1}/${responseParts.length}**`
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a messagee: `, err));
                                    }
                                }, i * 1000);
                            }
                        } else {
                            // Edit the initial message with the full response if it can fit in one message
                            initMessage.edit({
                                content: `${response}`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing the webhook message: `, err));
                        }
                        // Store previous conversation history
                        storeOrFetchConversationHistory(false, message, data.choices[0].message);
                    }
                })
                .catch(err => console.error(err));
        } catch (err) {
            console.error('There was a problem replying with an OpenAI response: ', err);
        }
    }
}