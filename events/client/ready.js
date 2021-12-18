const moment = require('moment');
const date = new Date();
require('dotenv').config();

module.exports = async (Discord, client, message) => {

  var guild = client.guilds.cache.get(process.env.SERVER_ID);

  console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `CreatorBot online`);

}


