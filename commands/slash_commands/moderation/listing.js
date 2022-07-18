const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const mongo = require('../../../mongo');
const path = require('path');
const rankSchema = require('../../../schemas/misc/rank_schema');

module.exports = {
    name: `listing`,
    description: `Approve or deny a user's marketplace listing`,
    access: 'staff',
    cooldown: 30,
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
        name: `approve`,
        description: `Approve a user's marketplace listing`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/listing approve [@username]`,
        options: [{
            name: `username`,
            description: `The user whos listing you want to approve`,
            type: ApplicationCommandOptionType.User,
            required: true
        }, {
            name: `title`,
            description: `The custom title for the listing`,
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    }, {
        name: `deny`,
        description: `Deny a user's marketplace listing`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/listing deny [@username]`,
        options: [{
            name: `username`,
            description: `The user whos listing you want to deny`,
            type: ApplicationCommandOptionType.User,
            required: true
        }, {
            name: `reason`,
            description: `The reason for denying the listing`,
            type: ApplicationCommandOptionType.String,
            required: true
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, member, options } = interaction;

        const target = options.getMember('username');
        const title = options.getString('title');
        const reason = options.getString('reason');

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        switch (options.getSubcommand()) {
            case 'approve': {
                target?.send({
                    content: `Your marketplace listing has been \`approved\`. Carefully read the following

When creating your listing please use the title below (copy and paste). You must not edit this title at any time without first getting it approved
\`\`\`${title}\`\`\`
To save yourself and your potential buyers some time, your listing message should contain any relevant information that a buyer might need to know before contacting you, such as;
<:minidot:923683258871472248> previous experience
<:minidot:923683258871472248> multiple work examples (links, images, videos, etc..)
<:minidot:923683258871472248> what information your require from them
<:minidot:923683258871472248> bundled package prices
<:minidot:923683258871472248> links to your payment methods

Your listing message must;
<:minidot:923683258871472248> include at least one example of your work (link, image, video, etc..) when applicable
<:minidot:923683258871472248> state whether or not you offer revisions of work

Your listing message must not;
<:minidot:923683258871472248> include links to other Discord servers
<:minidot:923683258871472248> include personal information (real name, address, emails, etc..)

Here is an example listing for you to work with: https://discord.com/channels/820889004055855144/996716567838593044

You can now create your listing in <#996686534512222228>. If your listing does not meet the requirements above, it may be deleted without notice

Want more eyes on your listing? Consider buying an ad spot in <#${process.env.PREM_CHAN}> for thousands of people to see
If you need any help, please contact <@438434841617367080>`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} ${target}'s listing has been approved`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
            }
        }

        switch (options.getSubcommand()) {
            case 'deny': {
                target?.send({
                    content: `Your marketplace listing has been \`denied\`
                    
The reason your listing was denied is;
<:minidot:923683258871472248> ${reason}

This does not mean you can't make a new listing. Please review the reason provided and make any required changes before resubmitting for approval
If you need any help, please contact <@438434841617367080>`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_DENY} ${target}'s listing has been denied`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
            }
        }
    }
}