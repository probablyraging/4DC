const ccVideoQueue = require('../../../schemas/creator_crew/video_queue');

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

		

		interaction.reply({ content: 'done', ephemeral: true });
	}
}


function convertTimestampToRelativeTime(dateToConvert) {
	const msPerMinute = 60;
	const msPerHour = msPerMinute * 60;
	const msPerDay = msPerHour * 24;
	const msPerMonth = msPerDay * 30;
	const myDate = new Date();
	const nowDate = myDate.setSeconds(myDate.getSeconds() + 1).toString().slice(0, 10);
	const elapsed = nowDate - dateToConvert.toString().slice(0, 10);
	if (elapsed < msPerMonth) {
		if (Math.round(elapsed / msPerDay) >= 3 && Math.round(elapsed / msPerDay) < 4) {
			return 3 || undefined;
		} else if (Math.round(elapsed / msPerDay) >= 5) {
			return 5 || undefined;
		}
	}
}