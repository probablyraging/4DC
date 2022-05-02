const { ContextMenuInteraction, Guild } = require('discord.js');
const fetch = require('node-fetch');
const path = require('path');

const mongo = require('../../../mongo');
const infoSchema = require('../../../schemas/misc/info_schema');

module.exports = {
	name: `dbupdate`,
	description: `Information regarding individual topics`,
	cooldown: 0,
	type: 'CHAT_INPUT',
	usage: `/info [category] [@username]`,
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction) {
		const { options, member } = interaction;

		member.send({ content: `Thanks for boosting CreatorHub ${member?.user.username},
You've unlocked some additional perks to better your experience on the server, you can read more about them below;

**CREATORHUB SERVER BOOSTER PERKS <:booster:931461963517685801>**
<:minidot:923683258871472248> The unique **Server Booster** role
<:minidot:923683258871472248> Access to the less competitive <#859117794779987978> content share channel
<:minidot:923683258871472248> Bypass the rank requirements for most of the locked channels
<:minidot:923683258871472248> <:twitch:837083090283003964> Automatic **Live Now** role when streaming on Twitch *
<:minidot:923683258871472248> <:twitch:837083090283003964> Automatically post your Twitch channel link to the <#859117794779987978> content share channel every time you go live on Twitch
<:minidot:923683258871472248> <:youtube:837083090441994240> Automatically post your YouTube video links to the <#859117794779987978> content share channel every time you upload new content to YouTube *
<:minidot:923683258871472248> Unlimited nickname changes while boosting
<:minidot:923683258871472248> Custom role, role icon and role color of your choosing *
<:minidot:923683258871472248> Custom sticker and emoji of your choosing *
		
* *To claim any of these perks, please contact a staff member*` })


	}
}



//---- SERVER BOOSTER STUFF

		// check if user is a server booster

		// const choice = options.getString('edit')
		// const currentRoleData = options.getRole('old')
		// const changedRoleData = options.getString('new')

		// const roleToEdit = guild.roles.cache.find(r => r.id === currentRoleData.id)

		// // disallow editing certain roles where the user may be the only user in the role
		// const uneditableRolesArr = ['839527054465826867', '878229140992589906', '821876910253670442']

		// if (uneditableRolesArr.includes(currentRoleData.id)) {
		// 	return console.log(`you can't edit this role`)
		// }

		// // check if the user is the only person in the role - if not, it's likely not a custom role so we shouldn't let them edit it
		// if (roleToEdit?.members?.size > 1) {
		// 	return console.log('not a custom role')
		// }

		// // the user must be in the role to edit it
		// if (!member?.roles?.cache.has(currentRoleData.id)) {
		// 	return console.log(`you are not in this role`)
		// }

		// // edit the name
		// if (choice === 'name') {
		// 	guild.roles.edit(roleToEdit, { name: changedRoleData }) // catch
		// }

		// // edit the color
		// if (choice === 'color') {
		// 	guild.roles.edit(roleToEdit, { color: changedRoleData.toUpperCase() }) // catch
		// }

		// // edit the icon
		// if (choice === 'icon') {

		// }


//----- GAME STUFF

// const { options } = interaction;
// /**
// "youtube_together": "880218394199220334",
// "watch_together_dev": "880218832743055411",
// "fishington": "814288819477020702",
// "chess_in_the_park": "832012774040141894",
// "chess_in_the_park_dev": "832012586023256104",
// "betrayal": "773336526917861400",
// "doodlecrew": "878067389634314250",
// "wordsnacks": "879863976006127627",
// "lettertile": "879863686565621790",
// "poker_night": "755827207812677713"
//  */

// const game = options.getString('start');

// // add these to ENV
// if (game === '880218394199220334') channelId = '964822154677981194'; // YouTube Together

// // create an application channel invite
// let resolve = await fetch(`https://discord.com/api/v9/channels/${channelId}/invites`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		max_age: 0,
// 		max_uses: 0,
// 		target_application_id: game,
// 		target_type: 2,
// 		temporary: false,
// 		validate: null
// 	}),
// 	headers: {
// 		"Authorization": `Bot ${process.env.BOT_TOKEN}`,
// 		"Content-Type": "application/json"
// 	}
// });

// const data = await resolve.json();

// interaction.reply({
// 	content: `[Click here](https://discord.gg/${data.code}) to join`
// })