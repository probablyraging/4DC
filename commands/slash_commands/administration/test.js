const { MessageEmbed, MessageSelectMenu, ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require('discord.js');
const { addCooldown, hasCooldown, removeCooldown } = require("../../../modules/misc/report_cooldown");
const { v4: uuidv4 } = require("uuid");
const warnSchema = require('../../../schemas/misc/warn_schema');
const { resArr } = require('../../../lists/rule-list');
const mongo = require('../../../mongo');
const countingSchema = require('../../../schemas/counting_game/counting_schema');
const { getRules } = require('../../../lists/rule-list');
const fetch = require('node-fetch');

module.exports = {
	name: `test`,
	description: `dummy command`,
	cooldown: 0,
	type: 'CHAT_INPUT',
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction, client) {
		const { options, member, guild } = interaction;

		await mongo().then(async mongoose => {
			const results = await countingSchema.find();

			for (const data of results) {
				const { userId } = data;

				const exists = guild.members?.cache.get(userId)

				let newAvatar = exists?.user.avatar
				let username = exists?.user.username
				let discrim = exists?.user.discriminator

				console.log(newAvatar, username, discrim)

				if (newAvatar === null) newAvatar = '0'

				await countingSchema.findOneAndUpdate({
					userId: userId
				}, {
					avatar: newAvatar,
					username: username,
					discriminator: discrim
				}, {
					upsert: true
				})



				// const exists = guild.members?.fetch(id).catch(err => console.log(id))

				// if (avatar === 'https://cdn.discordapp.com/embed/avatars/0.png') {
				// 	console.log(id)
				// 	await rankSchema.findOneAndUpdate({
				// 		id: id
				// 	}, {
				// 		avatar: '0'
				// 	}, {
				// 		upsert: true
				// 	})
				// }



			}
		})


		interaction.reply({ content: 'done', ephemeral: true })

	}
}


// {
//     _id: 61cf98c64629a865ad491b83,
//     id: '438434841617367080',
//     __v: 0,
//     discrim: '7080',
//     level: '72',
//     msgCount: '42143',
//     rank: 1,
//     username: 'ProbablyRaging',
//     xp: '759102',
//     xxp: '15788',
//     xxxp: '29620'
//   }