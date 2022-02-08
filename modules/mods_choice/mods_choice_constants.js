// Delay of 24 hours between posting videos
const delayBetweenVideos = 24 * 60 * 60 * 1000;

// Time constants
const interval = 15 * 60 * 1000;
const oneDay = 24 * 60 * 60 * 1000;
const twoDays = 2 * oneDay;
const threeDays = 3 * oneDay;
const fourDays = 4 * oneDay;
const fiveDays = 5 * oneDay;
const oneMonth = 31 * oneDay;

class ModsChoiceWarningType {

    static LACK_OF_TABS = new ModsChoiceWarningType("Lack of Tabs in Screenshot", "LACK_OF_TABS");
    static HAS_NOT_POSTED_PROOF = new ModsChoiceWarningType("Has Not Posted Proof", "HAS_NOT_POSTED_PROOF");

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

module.exports = {
    delayBetweenVideos,
    interval,
    twoDays,
    threeDays,
    fourDays,
    fiveDays,
    oneMonth,
    ModsChoiceWarningType
};
