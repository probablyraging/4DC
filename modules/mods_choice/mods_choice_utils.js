/**
 * @param {Number} milliseconds A number representing milliseconds
 * @return {String} A string of hours, minute and seconds that represents the passed milliseconds
 */
function msToHumanTime(milliseconds) {
    let hours = milliseconds / (1000 * 60 * 60);
    let hoursFloor = Math.floor(hours);

    let minutes = (hours - hoursFloor) * 60;
    let minutesFloor = Math.floor(minutes);

    let seconds = (minutes - minutesFloor) * 60;
    let secondFloor = Math.floor(seconds);

    return hoursFloor + " hours, " + minutesFloor + " minutes and " + secondFloor + " seconds";
}

/**
 * @param {String} string A content string
 * @return {RegExpExecArray | null} An array with capture group 1 being the video ID
 */
function getYoutubeVideoId(string) {
    // Match http/https and youtu.be/youtube.com URLs, along with youtube.com/shorts/
    let regExp = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/|be\.com\/shorts\/)([\w\-_]*)(&(amp;)[\w=]*)?/;
    // The execution of this regex returns the first YouTube video ID, or null
    return regExp.exec(string);
}

/**
 * @param {MessageAttachment} attachment A Discord MessageAttachment
 * @return {Boolean} True if the attachment ends in png or jpg, else false
 */
function attachmentIsImage(attachment) {
    let url = attachment.url.toLowerCase();
    return url.endsWith("png") || url.endsWith("jpg") || url.endsWith("gif");
}

module.exports = {
    msToHumanTime,
    getYoutubeVideoId,
    attachmentIsImage
};
