const { EmbedBuilder } = require('discord.js');
const { dbCreate, sendResponse } = require('../../utils/utils');
const massbanSchema = require('../../schemas/misc/mass_ban_schema');
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild } = interaction

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));
    let userListString = interaction.fields.getTextInputValue('user-list');
    let trimmedList = userListString.split(/\r?\n/).map(element => {
        return element.trim();
    });
    let trimmedListString = trimmedList.join("\n");

    let reason = interaction.fields.getTextInputValue('reason');
    let staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
    let id = uuidv4();

    let authorTag = member?.user.tag;
    let staffEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: `${authorTag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Mass Ban Request Needs Approval - use \`\/massban approve [id]\` or \`\/massban deny [id]\``)
        .addFields({ name: `Request ID`, value: id, inline: false },
            { name: `Reason`, value: reason, inline: false },
            { name: `User List to Ban`, value: trimmedListString, inline: true });

    staffChannel.send({
        content: `<@&${process.env.ADMIN_ROLE}>`,
        embeds: [staffEmbed]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

    await dbCreate(massbanSchema, { id: id, author: authorTag, timestamp: new Date().valueOf(), users: trimmedListString, reason: reason });

    sendResponse(interaction, `${process.env.BOT_CONF} The mass ban request has been received. Another staff member will need to approve the ban`);
}
