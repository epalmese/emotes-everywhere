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
            chrome.storage.sync.set({ ON: 1 });
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, { order: "start" }); //start emote insertions
                }
            });
        }
        else {
            chrome.storage.sync.set({ ON: 0 });
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, { order: "stop" }); //stop emote insertions
                }
            });
        }
    });

    document.getElementById("manage").addEventListener('click', function() { //show emote settings menu
        window.open(chrome.runtime.getURL('manage.html'));
    });
    document.getElementById("sites").addEventListener('click', function() { //show hostname settings menu
        document.getElementById("modal").className = "modal opened";
    });
    document.getElementById("close2").addEventListener('click', function() { //hide hostname settings menu
        document.getElementById("modal").className = "modal closed";
    });

    function listremove(s, i, el) { //add functionality to the hostname delete button
        el.addEventListener('click', function rmv() {
            s.splice(i, 1); //remove the hostname at the given index from the given set
            chrome.storage.sync.set({ HOSTS: s }, function() {
                showhosts(); //update hostname table
                listswap(); //use changed hostname set
            }); //save the changed set
            el.removeEventListener('click', rmv, false);
        }, false);
    }

    function listswap() { //use changed hostname set in current tabs
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { sitelist: "edit" });
            }
        });
    }

    document.getElementById("enable").addEventListener('click', function() { //add hostname of site in current tab to list
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function(tabs) {
            try {
                chrome.tabs.sendMessage(tabs[0].id, { sitelist: "get" }, function(response) { //enable for current site
                    try {
                        var hn = response.hostname;
                        if (hn != "") { //if hostname is not blank
                            chrome.storage.sync.get(['HOSTS'], function(result) { //check for custom hostnames
                                var hostnames = result.HOSTS;
                                if (hostnames == null) {
                                    document.getElementById("feedback4").textContent = "No hostname set to add to (default will be set on first webpage load).";
                                }
                                else {
                                    var found = false;
                                    for (var i = 0; i < hostnames.length; i++) {
                                        if (hn == hostnames[i]) {
                                            document.getElementById("feedback4").textContent = "Extension already enabled for \"" + hn + "\".";
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found == false) {
                                        hostnames.push(hn); //append new hostname to array for hostnames menu instance
                                        chrome.storage.sync.set({ HOSTS: hostnames }, function() {
                                            listswap(); //use changed hostname set
                                            document.getElementById("feedback4").textContent = "\"" + hn + "\" added.";
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            document.getElementById("feedback4").textContent = "No hostname found.";
                        }
                    }
                    catch (e) {
                        document.getElementById("feedback4").textContent = "This page is not running the extension.";
                    }
                });
            }
            catch (e) {
                document.getElementById("feedback4").textContent = "No browser tab selected.";
            }
        });
    });

    function showhosts() { //show table with all sites
        chrome.storage.sync.get(['HOSTS'], function(result) {
            var hostnames = result.HOSTS;
            var table = document.getElementById("hosttable");
            document.getElementById("alltable2").style.display = "block";
            while (table.firstChild) {
                table.removeChild(table.firstChild); //clears hostnames
            }
            if (hostnames == null) {
                document.getElementById("feedback5").textContent = "No hostname set to show (default will be set on first webpage load).";
            }
            else {
                document.getElementById("feedback5").textContent = "Your set has " + hostnames.length + " site(s):";
                var list = document.createDocumentFragment();
                for (var i = 0; i < hostnames.length; i++) {
                    var item = document.createElement("tr"); //table row
                    var box = document.createElement("td"); //table node
                    box.textContent = hostnames[i];
                    item.appendChild(box);
                    box = document.createElement("td"); //table node
                    var lbl = document.createElement("label"); //hostname remove button label
                    lbl.className = "btn red";
                    lbl.title = "remove";
                    lbl.textContent = "X";
                    btn = document.createElement("input"); //hostname remove button
                    btn.type = "button";
                    btn.className = "hide";
                    listremove(hostnames, i, btn); //make button remove adjacent hostname
                    lbl.appendChild(btn);
                    box.appendChild(lbl);
                    item.appendChild(box);
                    list.appendChild(item);
                }
                table.appendChild(list);
            }
        });
    }
    document.getElementById("seesites").addEventListener('click', showhosts);
}());
