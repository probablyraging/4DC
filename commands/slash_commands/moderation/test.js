const { ContextMenuInteraction, Guild } = require('discord.js');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
	name: `test`,
	description: `Information regarding individual topics`,
	cooldown: 30,
	type: 'CHAT_INPUT',
	usage: `/info [category] [@username]`,
	options: [{
		name: `select`,
		description: `Select`,
		type: `STRING`,
		required: true,
		choices: [{ name: 'review', value: 'review' },
		{ name: 'connections', value: 'connections' },
		{ name: 'seo', value: 'seo' }]
	},
	{
		name: `username`,
		description: `Username`,
		type: `USER`,
		required: true
	}],
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction) {

		
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