const attachmentMap = new Map();

function addAttachment(key, url) {
    attachmentMap.set(key, url);
}

function getAttachment(key) {
    let attachment = attachmentMap.get(key);
    attachmentMap.delete(key);
    return attachment;
}

module.exports = {
    addAttachment,
    getAttachment
};