const MATECAT_REGEX = "/(translate|revise)/[^/]+/[a-zA-Z-]+/[0-9]+-[0-9a-z]+#[0-9]+$";

chrome.tabs.onCreated.addListener(function(newTab) {
    chrome.tabs.getAllInWindow(newTab.windowId, function(tabs) {
        var regex = new RegExp(MATECAT_REGEX);
        if (regex.test(newTab.url)) {
            // Check if we have the Matecat job open to avoid opening a second one
            // and running out of sockets
            var duplicateTab = null;
            tabs.forEach(function(otherTab) {
                if (otherTab.id !== newTab.id && otherTab.url.split('#')[0] === newTab.url.split('#')[0]) {
                    duplicateTab = otherTab;
                }
            });
            if (duplicateTab) {
                chrome.tabs.remove(newTab.id);
                chrome.tabs.update(duplicateTab.id, {"selected": true, "url": newTab.url});
            }
        }
    });
});