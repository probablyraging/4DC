const cooldownList = new Set();

function addCooldown(userId) {
    return cooldownList.add(userId);
}

function removeCooldown(userId) {
    return cooldownList.delete(userId);
}

function hasCooldown(userId) {
    return cooldownList.has(userId);
}

module.exports = {
    addCooldown,
    removeCooldown,
    hasCooldown
};