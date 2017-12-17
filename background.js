function sha256(str) {
    // We transform the string into an arraybuffer.
    var buffer = new TextEncoder("utf-8").encode(str);
    return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
        return hex(hash);
    });
}

function hex(buffer) {
    var hexCodes = [];
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        var value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        var stringValue = value.toString(16)
        // We use concatenation and slice for padding
        var padding = '00000000'
        var paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue);
    }

    // Join all the hex strings into one
    return hexCodes.join("");
}

var getHostName = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l.hostname;
}

var sites = [
    "5817e30b60c7c20dc16c037da9f32244ca040610b1420fc49c47a268d0f4e76e", // wmc
    "bd9e3643adb1e3f3e0df67485832e9b8e2dbe85dac9b926e695bc7e60b2347bc", // bmc
    "f69dff9562a3d1cf7e01c5526669f431f8a0d966c86556a79f823b718fee5929"  // cpn
]

chrome.tabs.onCreated.addListener(function(newTab) {
    chrome.tabs.getAllInWindow(newTab.windowId, function(tabs) {
        sha256(getHostName(newTab.url)).then(function(digest) {
            if (sites.indexOf(digest) >= 0) {
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
});