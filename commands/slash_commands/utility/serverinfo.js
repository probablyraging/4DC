const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActivityType } = require('discord.js');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    name: `serverinfo`,
    description: `Get information and stats about the server`,
    access: '',
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    usage: `/serverinfo`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true });

        let activityTypes = [ActivityType.Streaming, ActivityType.Playing, ActivityType.Listening, ActivityType.Watching, ActivityType.Competing, ActivityType.Custom];

        activityArr = [];

        guild.members.fetch().then(async fetchedMembers => {
            const resolve = await fetch('https://discord.com/api/v9/guilds/820889004055855144?with_counts=true', { headers: { "Authorization": `Bot ${process.env.BOT_TOKEN}` } });
            const data = await resolve.json();
            let online = data.approximate_presence_count;

            let idle = fetchedMembers.filter(member => member.presence?.status === 'idle').size;
            let dnd = fetchedMembers.filter(member => member.presence?.status === 'dnd').size;

            for (let j = 0; j < activityTypes.length; j++) {
                let activityType = activityTypes[j];

                for (let i = 0; i < activityTypes.length; i++) {
                    fetchedMembers.forEach(member => {
                        if (member.presence?.activities[i] && member.presence?.activities[i].type === activityType) {
                            activityArr.push(activityType);
                        }
                    });
                }
            }

            streaming = 0;
            playing = 0;
            watching = 0;
            listening = 0;
            competing = 0;
            custom = 0;

            activityArr.forEach(activity => {
                if (activity === 0) playing++;
                if (activity === 1) streaming++;
                if (activity === 3) watching++;
                if (activity === 4) listening++;
                if (activity === 5) competing++;
                if (activity === 4) custom++;
            });

            const description = guild.description || 'None';

            let premiumTier = guild.premiumTier;

            if (guild.premiumTier === 'NONE') premiumTier = '0';
            if (guild.premiumTier === 'TIER_1') premiumTier = '1';
            if (guild.premiumTier === 'TIER_2') premiumTier = '2';
            if (guild.premiumTier === 'TIER_3') premiumTier = '3';

            if (!guild.vanityURLCode) {
                vanityURL = 'None';
            } else {
                vanityURL = `https://discord.gg/${guild.vanityURLCode}`;
            }

            function converTimestampToSimpleFormat(timestamp) {
                const t = new Date(timestamp);
                const date = ('0' + t.getDate()).slice(-2);
                const month = ('0' + (t.getMonth() + 1)).slice(-2);
                const year = t.getFullYear();
                const hours = ('0' + t.getHours()).slice(-2);
                const minutes = ('0' + t.getMinutes()).slice(-2);
                const seconds = ('0' + t.getSeconds()).slice(-2);
                const time = `${date}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                return time;
            }

            var createdAt = converTimestampToSimpleFormat(new Date(guild.createdTimestamp).getTime());

            const response = new EmbedBuilder()
                .setColor('#32BEA6') // GREEN
                .setTitle(`${guild.name}'s Server Information`)
                .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
                .setImage()
                .addFields({ name: `Name`, value: `${guild.name}`, inline: true },
                { name: `Owner`, value: `<@${guild.ownerId}>`, inline: true },
                { name: `Region`, value: `Australia`, inline: true },
                { name: `Description`, value: `${description}`, inline: false },
                { name: `Server Boosts`, value: `${guild.premiumSubscriptionCount}`, inline: true },
                { name: `Boost Tier`, value: `${premiumTier}`, inline: true },
                { name: `Created On`, value: `${createdAt}`, inline: true },
                { name: `Vanity URL`, value: `${vanityURL}`, inline: false })

            const response2 = new EmbedBuilder()
                .setColor('#32BEA6') // GREEN
                .setTitle(`${guild.name}'s Server Stats`)
                .addFields({ name: `Online`, value: `${online}`, inline: true },
                { name: `Idle`, value: `${idle}`, inline: true },
                { name: `DND`, value: `${dnd}`, inline: true },
                { name: `Playing`, value: `${playing}`, inline: true },
                { name: `Streaming`, value: `${streaming}`, inline: true },
                { name: `Watching`, value: `${watching}`, inline: true },
                { name: `Listening`, value: `${listening}`, inline: true },
                { name: `Custom`, value: `${custom}`, inline: true },
                { name: `Competing`, value: `${competing}`, inline: true },
                { name: `Total Members`, value: `${guild.memberCount}`, inline: false })

            interaction.editReply({
                embeds: [response, response2],
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        });
    }
}