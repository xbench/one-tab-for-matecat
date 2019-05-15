const MATECAT_REGEX = "/(translate|revise)/[^/]+/[a-zA-Z-]+/[0-9]+-[0-9a-z]+#[0-9]+$";
const SMARTCAT_REGEX = "smartcat\.ai/editor\?.*DocumentId=[0-9a-f]+.*LanguageId=[0-9]+";
const LINGOTEK_REGEX = "/workbench/task/[0-9a-f\-]+/segment/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const MATECAT_SEGMENT_LABEL = "#";
const SMARTCAT_SEGMENT_LABEL = "&SegmentIndex=";
const LINGOTEK_SEGMENT_LABEL = "/task/";

function HasPatternThenProcess(newTab, tabs, pattern, segmentLabel) {
    var regex = new RegExp(pattern);
    if (regex.test(newTab.url)) {
        // Check if we have the job open to avoid opening a second one
        // and running out of sockets
        var duplicateTab = null;
        tabs.forEach(function(otherTab) {
            if (otherTab.id !== newTab.id && otherTab.url.split(segmentLabel)[0] === newTab.url.split(segmentLabel)[0]) {
                duplicateTab = otherTab;
            }
        });
        if (duplicateTab) {
            chrome.tabs.remove(newTab.id);
            chrome.tabs.update(duplicateTab.id, {"selected": true, "url": newTab.url});
        }
        return true;
    }
    return false;
}

chrome.tabs.onCreated.addListener(function(newTab) {
    chrome.tabs.getAllInWindow(newTab.windowId, function(tabs) {
        if (HasPatternThenProcess(newTab, tabs, MATECAT_REGEX, MATECAT_SEGMENT_LABEL)) return;
        if (HasPatternThenProcess(newTab, tabs, SMARTCAT_REGEX, SMARTCAT_SEGMENT_LABEL)) return;
        if (HasPatternThenProcess(newTab, tabs, LINGOTEK_REGEX, LINGOTEK_SEGMENT_LABEL)) return;
    });
});