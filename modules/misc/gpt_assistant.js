import { dbFindOne, dbUpdateOne, dbDeleteOne } from '../../utils/utils.js';
import gptHistorySchema from '../../schemas/gpt_history_schema.js';
import axios from 'axios';

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
        const formattedUserData = { 'role': 'user', 'content': userData.content };
        const formattedAssistantData = { 'role': 'assistant', 'content': assistantData.content };
        const updatedConversations = [...conversationHistory, formattedUserData, formattedAssistantData];
        // Only keep the last 6 entries
        if (updatedConversations.length > 6) {
            updatedConversations.splice(0, updatedConversations.length - 6);
        }
        // Update the conversation history in the database
        await dbUpdateOne(gptHistorySchema, { userId: userData.author.id }, { userId: userData.author.id, conversations: updatedConversations });
    }
}

export default async (message) => {
    if (message.channel.id === process.env.GPT_CHAN && !message.author.bot) {
        if (message.content.startsWith('>')) return;
        try {
            const initMessage = await message.reply({
                content: 'Let me think..'
            }).catch(err => console.error('There was a problem sending a webhook: ', err));

            // Get previous conversation history from database
            const conversationHistory = await storeOrFetchConversationHistory(true, message);

            const requestData = {
                'model': 'gpt-3.5-turbo-1106',
                'messages': [
                    { 'role': 'system', 'content': 'You are a specialized assistant dedicated to helping Discord users with questions and advice related to all types of content creation. Your expertise includes, but is not limited to, video production, streaming, graphic design, writing, audio creation, and social media strategy. You should provide up to date accurate, helpful, and detailed responses that facilitate users in enhancing their content creation skills and knowledge. Use Discord markdown in your responses.' },
                    ...conversationHistory,
                    { 'role': 'user', 'content': message.content }
                ],
                'temperature': 0.7,
                'max_tokens': 750
            };

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OAI_KEY}`
            };

            // Send request to the open AI API
            const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, { headers });
            const data = response.data;

            // If the response is empty or there are no choices, edit the initial message to show an error message
            if (!data || !data.choices) {
                initMessage.edit({
                    content: 'Sorry, I was unable to generate an answer. Please try again'
                }).catch(err => console.error('There was a problem editing a message: ', err));
                await dbDeleteOne(gptHistorySchema, { userId: message?.author.id });
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
                                }).catch(err => console.error('There was a problem editing a message: ', err));
                            } else {
                                // Send a reply to the channel with the next part of the response
                                message.reply({
                                    content: `..${responseParts[i]} \n**${i + 1}/${responseParts.length}**`
                                }).catch(err => console.error('There was a problem editing a messagee: ', err));
                            }
                        }, i * 1000);
                    }
                } else {
                    // Edit the initial message with the full response if it can fit in one message
                    initMessage.edit({
                        content: `${response}`
                    }).catch(err => console.error('There was a problem editing the webhook message: ', err));
                }
                // Store previous conversation history
                storeOrFetchConversationHistory(false, message, data.choices[0].message);
            }
        } catch (err) {
            console.error('There was a problem replying with an OpenAI response: ', err);
        }
    }
};