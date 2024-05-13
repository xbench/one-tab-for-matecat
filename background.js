const MATECAT_REGEX = "/(translate|revise)/[^/]+/[a-zA-Z-]+/[0-9]+-[0-9a-z]+#[0-9]+$";
const SMARTCAT_REGEX = "smartcat\.(ai|com)\/editor\?.*[Dd]ocumentId=[0-9a-f]+.*[Ll]anguageId=[0-9]+";
const LINGOTEK_REGEX = "/workbench/task/[0-9a-f\-]+/segment/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const CROWDIN_REGEX = "crowdin\.com/translate/.*#";

const MATECAT_SEGMENT_LABEL = "#";
const SMARTCAT_SEGMENT_LABEL = "&segment";
const LINGOTEK_SEGMENT_LABEL = "/task/";
const CROWDIN_SEGMENT_LABEL = "#";

function IsSameDocument(existingTabPrefix, newTabPrefix, segmentLabel, caseSensitive) {
    if (caseSensitive) {
		var leftText = existingTabPrefix;
		var rightText = newTabPrefix;
		var label = segmentLabel;
    } else {
		var leftText = existingTabPrefix.toLowerCase();
		var rightText = newTabPrefix.toLowerCase();
		var label = segmentLabel.toLowerCase();
	}
	return leftText.split(label)[0] === rightText.split(label)[0];
}

function HasPatternThenProcess(newTab, tabs, pattern, segmentLabel, killOriginalTab, caseSensitive) {
    var regex = new RegExp(pattern);
    if (regex.test(newTab.url)) {
        var duplicateTab = null;
        tabs.forEach(function(otherTab) {
            if (otherTab.id !== newTab.id && IsSameDocument(otherTab.url, newTab.url, segmentLabel, caseSensitive)) {
                duplicateTab = otherTab;
            }
        });
        if (duplicateTab) {
        	if (killOriginalTab) {
        		chrome.tabs.remove(duplicateTab.id);
            } else {
            	chrome.tabs.remove(newTab.id);
            	chrome.tabs.update(duplicateTab.id, {"selected": true, "url": newTab.url});
            }
        }
        return true;
    }
    return false;
}

lastId = -1;

function reuseExistingEditor(tab) {
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
        if (HasPatternThenProcess(tab, tabs, MATECAT_REGEX, MATECAT_SEGMENT_LABEL, false, true)) return;
        if (HasPatternThenProcess(tab, tabs, SMARTCAT_REGEX, SMARTCAT_SEGMENT_LABEL, false, false)) return;
        if (HasPatternThenProcess(tab, tabs, LINGOTEK_REGEX, LINGOTEK_SEGMENT_LABEL, false, true)) return;
        if (HasPatternThenProcess(tab, tabs, CROWDIN_REGEX, CROWDIN_SEGMENT_LABEL, true, true)) return;
    });
    lastId = -1;
}

chrome.tabs.onCreated.addListener(function(newTab) {
    lastId = newTab.id;
    if (newTab.url && (newTab.url != "")) {
        reuseExistingEditor(newTab);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if ((tabId == lastId) && (info.url)) {
        reuseExistingEditor(tab);
    }
});
