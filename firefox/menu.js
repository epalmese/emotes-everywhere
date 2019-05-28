(function() {
    var ONSWITCH = document.getElementById("onswitch");

    chrome.storage.sync.get(['ON'], function(result) {
        if (result.ON == 1) { //on if ON is set to 1
            ONSWITCH.checked = true;
        }
        else { //off if ON is set to 0 or undefined
            ONSWITCH.checked = false;
        }
    });

    ONSWITCH.addEventListener('change', function() { //toggle extension on and off
        if (this.checked) {
            chrome.storage.sync.set({ ON: 1 }, function() {
                console.log("ON switched");
            });
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, { order: "start" }); //start emote insertions
                }
            });
        }
        else {
            chrome.storage.sync.set({ ON: 0 }, function() {
                console.log("OFF switched");
            });
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, { order: "stop" }); //stop emote insertions
                }
            });
        }
    });

    document.getElementById("manage").addEventListener('click', function() { //show settings menu
        window.open(chrome.runtime.getURL('manage.html'));
    });
}());
