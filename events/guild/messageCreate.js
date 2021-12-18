require('dotenv').config();

module.exports = async (Discord, client, message) => {

  const guild = client.guilds.cache.get(process.env.GUILD_ID);

}