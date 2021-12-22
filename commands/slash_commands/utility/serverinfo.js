const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `serverinfo`,
    description: `Get information and stats about the server`,
    permission: ``,
    type: `CHAT_INPUT`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        let activityTypes = ["STREAMING", "PLAYING", "WATCHING", "COMPETING", "CUSTOM"];

        activityArr = [];

        guild.members.fetch().then(async fetchedMembers => {
            let online = fetchedMembers.filter(member => !member.presence?.status).size;
            let idle = fetchedMembers.filter(member => member.presence?.status === 'idle').size;
            let dnd = fetchedMembers.filter(member => member.presence?.status === 'dnd').size;

            for (let j = 0; j < activityTypes.length; j++) {
                let activityType = activityTypes[j];

                for (let i = 0; i < 5; i++) {
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
            competing = 0;
            custom = 0;

            activityArr.forEach(activity => {
                if (activity === 'STREAMING') streaming++;
                if (activity === 'PLAYING') playing++;
                if (activity === 'WATCHING') watching++;
                if (activity === 'COMPETING') competing++;
                if (activity === 'CUSTOM') custom++;
            });

            const description = guild.description || 'None';

            if (guild.premiumTier === 'NONE') premiumTier = '0';

            if (!guild.vanityURLCode) {
                vanityURL = 'None';
            } else {
                vanityURL = `https://discord.gg/${guild.vanityURLCode}`;
            }

            var createdAt = new Date(guild.createdTimestamp).toUTCString()

            const response = new MessageEmbed()
                .setColor('#32BEA6') // GREEN
                .setTitle(`${guild.name}'s Server Information`)
                .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
                .setImage()
                .addField(`Name:`, `${guild.name}`, true)
                .addField(`Owner:`, `<@${guild.ownerId}>`, true)
                .addField(`Region:`, `Australia`, true)
                .addField(`Description:`, `${description}`, false)
                .addField(`Server Boosts:`, `${guild.premiumSubscriptionCount}`, true)
                .addField(`Boost Tier:`, `${premiumTier}`, true)
                .addField(`Created On:`, `${createdAt}`, true)
                .addField(`Vanity URL:`, `${vanityURL}`, false)

            const response2 = new MessageEmbed()
                .setColor('#32BEA6') // GREEN
                .setTitle(`${guild.name}'s Server Stats`)
                .addField(`Online:`, `${online}`, true)
                .addField(`Idle:`, `${idle}`, true)
                .addField(`DND:`, `${dnd}`, true)
                .addField(`Playing:`, `${playing}`, true)
                .addField(`Streaming:`, `${streaming}`, true)
                .addField(`Watching:`, `${watching}`, true)
                .addField(`Custom:`, `${custom}`, true)
                .addField(`Competing:`, `${competing}`, true)
                .addField(`Total Members:`, `${guild.memberCount}`, false)

            await interaction.reply({
                embeds: [response, response2],
                ephemeral: true
            });
        });
    }
}