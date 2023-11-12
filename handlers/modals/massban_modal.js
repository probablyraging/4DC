const { EmbedBuilder } = require('discord.js');
const { dbCreate, sendResponse } = require('../../utils/utils');
const massbanSchema = require('../../schemas/mass_ban_schema');
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild } = interaction

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);

    // Get the list of users to ban as a string and split it by line breaks
    const userListString = interaction.fields.getTextInputValue('user-list');
    const trimmedList = userListString.split(/\r?\n/).map(element => {
        return element.trim();
    });
    // Convert the array of users back to a string
    const trimmedListString = trimmedList.join("\n");
    // Get the reason for the mass ban request
    const reason = interaction.fields.getTextInputValue('reason');
    const uniqueId = uuidv4();

    let staffEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: member?.user.username, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Mass Ban Request Needs Approval - use \`\/massban approve [id]\` or \`\/massban deny [id]\``)
        .addFields({ name: `Request ID`, value: uniqueId, inline: false },
            { name: `Reason`, value: reason, inline: false },
            { name: `User List to Ban`, value: trimmedListString, inline: true });

    staffChannel.send({
        content: ``,
        embeds: [staffEmbed]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

    // Create a database entry for the new mass ban request
    await dbCreate(massbanSchema, { id: uniqueId, author: member.user.username, timestamp: new Date().valueOf(), users: trimmedListString, reason: reason });

    sendResponse(interaction, `${process.env.BOT_CONF} The mass ban request has been received. Another staff member will need to approve the ban`);
}
