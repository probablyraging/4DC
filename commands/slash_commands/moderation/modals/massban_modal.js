const {MessageEmbed} = require('discord.js');
const path = require('path');
const massbanSchema = require('../../../../schemas/misc/mass_ban_schema');
const {v4: uuidv4} = require("uuid");

module.exports = async (interaction) => {
    const {member, guild} = interaction

    if (interaction.customId === 'massban-modal') {
        const userListString = interaction.fields.getTextInputValue('user-list');
        const reason = interaction.fields.getTextInputValue('reason');
        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
        let id = uuidv4();

        let authorTag = member?.user.tag;
        const staffEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setAuthor({name: `${authorTag}`, iconURL: member?.user.displayAvatarURL({dynamic: true})})
            .setDescription(`Mass Ban Request Needs Approval - use \`\/massban approve [id]\` or \`\/massban deny [id]\``)
            .addField("Request ID", id)
            .addField("Reason", reason)
            .addField("User List to Ban", userListString, true);

        staffChannel.send({
            content: `<@&${process.env.STAFF_ROLE}>`,
            embeds: [staffEmbed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        await massbanSchema.create({
            id: id,
            author: authorTag,
            timestamp: new Date().valueOf(),
            users: userListString,
            reason: reason
        });

        interaction.reply({
            content: `${process.env.BOT_CONF} \`The mass ban request has been received. Another staff member will need to approve the ban.\``,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}
