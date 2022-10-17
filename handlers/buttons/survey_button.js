const surveySchema = require('../../schemas/misc/survey_schema');

module.exports = async (interaction) => {
    const { client, customId } = interaction;

    await interaction.deferUpdate();

    if (customId.split('-')[1] === 'reddit') {
        try {
            const results = await surveySchema.find();
            for (const data of results) {
                await surveySchema.updateOne({
                    reddit: data.reddit
                }, {
                    reddit: data.reddit + 1 || 1
                }, {
                    upsert: true
                });
            }
            const dmChan = client.channels.cache.get(interaction.channelId);
            const dmMsg = await dmChan.messages.fetch(interaction.message.id);
            dmMsg.delete();
            dmChan.send({
                content: `Thanks, your answer has been submitted
    Enjoy your time in the ForTheContent server. Please make sure you read the <#820909722458652674> channel when joining, and let staff know if you need help with anything at all` });
        } catch {
            console.error('Could not log survey response');
        }
    }

    if (customId.split('-')[1] === 'google') {
        try {
            const results = await surveySchema.find();
            for (const data of results) {
                await surveySchema.updateOne({
                    google: data.google
                }, {
                    google: data.google + 1 || 1
                }, {
                    upsert: true
                });
            }
            const dmChan = client.channels.cache.get(interaction.channelId);
            const dmMsg = await dmChan.messages.fetch(interaction.message.id);
            dmMsg.delete();
            dmChan.send({
                content: `Thanks, your answer has been submitted
Enjoy your time in the ForTheContent server. Please make sure you read the <#820909722458652674> channel when joining, and let staff know if you need help with anything at all` });
        } catch {
            console.error('Could not log survey response');
        }
    }

    if (customId.split('-')[1] === 'youtube') {
        try {
            const results = await surveySchema.find();
            for (const data of results) {
                await surveySchema.updateOne({
                    youtube: data.youtube
                }, {
                    youtube: data.youtube + 1 || 1
                }, {
                    upsert: true
                });
            }
            const dmChan = client.channels.cache.get(interaction.channelId);
            const dmMsg = await dmChan.messages.fetch(interaction.message.id);
            dmMsg.delete();
            dmChan.send({
                content: `Thanks, your answer has been submitted
Enjoy your time in the ForTheContent server. Please make sure you read the <#820909722458652674> channel when joining, and let staff know if you need help with anything at all` });
        } catch {
            console.error('Could not log survey response');
        }
    }

    if (customId.split('-')[1] === 'friend') {
        try {
            const results = await surveySchema.find();
            for (const data of results) {
                await surveySchema.updateOne({
                    friend: data.friend
                }, {
                    friend: data.friend + 1 || 1
                }, {
                    upsert: true
                });
            }
            const dmChan = client.channels.cache.get(interaction.channelId);
            const dmMsg = await dmChan.messages.fetch(interaction.message.id);
            dmMsg.delete();
            dmChan.send({
                content: `Thanks, your answer has been submitted
Enjoy your time in the ForTheContent server. Please make sure you read the <#820909722458652674> channel when joining, and let staff know if you need help with anything at all` });
        } catch {
            console.error('Could not log survey response');
        }
    }

    if (customId.split('-')[1] === 'other') {
        try {
            const results = await surveySchema.find();
            for (const data of results) {
                await surveySchema.updateOne({
                    other: data.other
                }, {
                    other: data.other + 1 || 1
                }, {
                    upsert: true
                });
            }
            const dmChan = client.channels.cache.get(interaction.channelId);
            const dmMsg = await dmChan.messages.fetch(interaction.message.id);
            dmMsg.delete();
            dmChan.send({
                content: `Thanks, your answer has been submitted
Enjoy your time in the ForTheContent server. Please make sure you read the <#820909722458652674> channel when joining, and let staff know if you need help with anything at all` });
        } catch {
            console.error('Could not log survey response');
        }
    }
}