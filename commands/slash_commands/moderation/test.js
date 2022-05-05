const { ContextMenuInteraction } = require('discord.js');

module.exports = {
	name: `testing`,
    description: `dummy command`,
	cooldown: 0,
	type: 'CHAT_INPUT',
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction) {
		const { options } = interaction;

		console.log(testing)

	}
}