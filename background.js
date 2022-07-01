const SMARTLING_REGEX = "/dashboard.smartling.com/app/projects/.*/workflowFilters:translation-memory$";

const PUBLISHED = "workflowFilters:translation-memory";
const IN_PROGRESS = "workflowFilters:in-progress"; 

chrome.tabs.onCreated.addListener(function(newTab) {
    var regex = new RegExp(pattern);
    if (regex.test(newTab.url)) {
        chrome.tabs.update(newTab.id, {"selected": true, "url": newTab.url.replace(PUBLISHED, IN_PROGRESS)});
    }    
});