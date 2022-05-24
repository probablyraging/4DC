const mongo = require('../mongo');
const ruleSchema = require('../schemas/misc/rule_schema');

async function getRules() {
    let resArr = [];
    await mongo().then(async mongoose => {
        const results = await ruleSchema.find();
        results.forEach(result => {
            resArr.push(result.value);
        })
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    return resArr;
}

module.exports = {
    getRules
}