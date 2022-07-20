const ruleSchema = require('../schemas/misc/rule_schema');

async function getRules() {
    let resArr = [];
    const results = await ruleSchema.find();
    results.forEach(result => {
        resArr.push(result.value);
    })
    return resArr;
}

module.exports = {
    getRules
}