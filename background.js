chrome.tabs.onCreated.addListener(function(newTab) {
    chrome.tabs.getAllInWindow(newTab.windowId, function(tabs) {
    	var matecatTranslate = "https://www.matecat.com/translate/";
    	var matecatRevise = "https://www.matecat.com/revise/";

      // Check if we have the Matecat job open to avoid opening a second one
      // and running out of sockets
    	if ((newTab.url.lastIndexOf(matecatTranslate, 0) === 0) ||
    		  (newTab.url.lastIndexOf(matecatRevise, 0) === 0)) {
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