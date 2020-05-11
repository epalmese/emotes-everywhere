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
        document.getElementById("modal").className = "modal opened";
    });
    document.getElementById("close").addEventListener('click', function() { //hide emote settings menu
        document.getElementById("modal").className = "modal closed";
    });
    document.getElementById("sites").addEventListener('click', function() { //show hostname settings menu
        document.getElementById("modal2").className = "modal opened";
    });
    document.getElementById("close2").addEventListener('click', function() { //hide hostname settings menu
        document.getElementById("modal2").className = "modal closed";
    });

    document.getElementById("import").addEventListener('change', function(event) { //import emote set file
        var reader = new FileReader();
        reader.onload = function() {
            try {
                var loaded = JSON.parse(reader.result);
                if (loaded && typeof loaded === "object") {
                    chrome.storage.sync.set({ SET: loaded }, function() { //set emote reference object array
                        document.getElementById("feedback1").textContent = "Import successful.";
                        document.getElementById("feedback2").textContent = "";
                        document.getElementById("found").className = "hide";
                        document.getElementById("feedback3").textContent = "";
                        document.getElementById("alltable1").style.display = "none";
                        setswap(); //use changed emote set
                    });
                }
            }
            catch (e) {
                document.getElementById("feedback1").textContent = "Import failed.";
            }
        };
        reader.readAsText(event.target.files[0]);
        document.getElementById("import").value = ""; //clears loaded file so it can be selected again
    });

    var savelink = null; //null by default
    document.getElementById("export").addEventListener('click', function() { //export emote set file
        chrome.storage.sync.get(['SET'], function(result) { //check for custom emotes at page load
            if (result.SET == null) {
                document.getElementById("feedback1").textContent = "No emote set to export (default will be set on first webpage load).";
            }
            else {
                if (savelink) {
                    URL.revokeObjectURL(savelink); //releases blob (not done immediately so link has enough time)
                }
                var blob = new Blob([JSON.stringify(result.SET)], { type: "text/plain;charset=utf-8" });
                savelink = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.setAttribute("href", savelink);
                a.setAttribute("download", "my.emotes");
                document.body.appendChild(a); //must append or certain browsers will not click()
                a.click(); //activates download
                a.remove();
                document.getElementById("feedback1").textContent = "Emote set exported.";
            }
        });
    });

    document.getElementById("add").addEventListener('click', function() { //add emote to set
        chrome.storage.sync.get(['SET'], function(result) { //check for custom emotes
            var emotes = result.SET;
            if (emotes == null) {
                document.getElementById("feedback2").textContent = "No emote set to add to (default will be set on first webpage load).";
            }
            else {
                var c = document.getElementById("code").value;
                if (c == "") {//if code field is blank
                    document.getElementById("feedback2").textContent = "No code given.";
                    document.getElementById("found").className = "hide";
                }
                else if (c.match("^[A-Za-z0-9:_]+$")) { //allowed characters
                    var found = false;
                    for (var i = 0; i < emotes.length; i++) {
                        if (c == emotes[i].code) {
                            document.getElementById("feedback2").textContent = "Code already in use as:";
                            found = true;
                            document.getElementById("addedimg").src = emotes[i].src;
                            setremove(c); //make button remove found emote
                            document.getElementById("found").className = "show";
                            break;
                        }
                    }
                    if (found == false) {
                        var s = document.getElementById("src").value;
                        if (s == "") { //if source field is blank
                            document.getElementById("feedback2").textContent = "Code not found.";
                            document.getElementById("found").className = "hide";
                        }
                        else {
                            emotes.push({ code: c, src: s }); //append new emote to array for emotes
                            chrome.storage.sync.set({ SET: emotes }, function() { //set emote reference object array
                                document.getElementById("feedback2").textContent = "Code added with image:";
                                document.getElementById("addedimg").src = s;
                                setremove(c); //make button remove new emote
                                document.getElementById("found").className = "show";
                                setswap(); //use changed emote set
                            });
                        }
                    }
                }
                else {
                    document.getElementById("feedback2").textContent = "Code contains invalid characters.";
                }
            }
        });
    });

    function setremove(c) { //add functionality to the emote delete button
        var rmvbtn = document.getElementById("del");
        rmvbtn.addEventListener('click', function rmv() {
            document.getElementById("found").className = "hide";
            chrome.storage.sync.get(['SET'], function(result) { //check for custom emotes
                var emotes = result.SET;
                for (var i = 0; i < emotes.length; i++) {
                    if (c == emotes[i].code) {
                        emotes.splice(i, 1); //remove the emote at the given index from the given set
                        chrome.storage.sync.set({ SET: emotes }, function() { //save the changed set
                            if (document.getElementById("alltable1").style.display == "block") {
                                showemotes(); //update emote table
                            }
                            setswap(); //use changed emote set
                        });
                        break;
                    }
                }
            });
            document.getElementById("feedback2").textContent = "Emote removed.";
            rmvbtn.removeEventListener('click', rmv, false);
        }, false);
    }

    function setswap() { //use changed emote set in current tabs
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { newemotes: "change" });
            }
        });
    }

    function showemotes() { //show table with all emotes
        chrome.storage.sync.get(['SET'], function(result) {
            var emotes = result.SET;
            var table = document.getElementById("emotetable");
            document.getElementById("alltable1").style.display = "block";
            while (table.firstChild) {
                table.removeChild(table.firstChild); //clears emotes
            }
            if (emotes == null) {
                document.getElementById("feedback3").textContent = "No emote set to show (default will be set on first webpage load).";
            }
            else {
                document.getElementById("feedback3").textContent = "Your set has " + emotes.length + " emote(s):";
                var list = document.createDocumentFragment();
                for (var i = 0; i < emotes.length; i++) {
                    var item = document.createElement("tr"); //table row
                    var box = document.createElement("td"); //table node
                    box.textContent = emotes[i].code;
                    item.appendChild(box);
                    box = document.createElement("td"); //table node
                    var img = document.createElement("img"); //table node
                    img.src = emotes[i].src;
                    box.appendChild(img);
                    item.appendChild(box);
                    box = document.createElement("td"); //table node
                    var lbl = document.createElement("label"); //emote remove button label
                    lbl.className = "btn red";
                    lbl.title = "remove";
                    lbl.textContent = "X";
                    btn = document.createElement("input"); //emote remove button
                    btn.type = "button";
                    btn.className = "hide";
                    listremove(emotes, i, btn, 1); //make button remove adjacent emote
                    lbl.appendChild(btn);
                    box.appendChild(lbl);
                    item.appendChild(box);
                    list.appendChild(item);
                }
                table.appendChild(list);
            }
        });
    }
    document.getElementById("see").addEventListener('click', showemotes);

    function listremove(s, i, el, l) { //add functionality to the emote and hostname delete buttons
        el.addEventListener('click', function rmv() {
            s.splice(i, 1); //remove the element at the given index from the given set
            if (l == 1) {
                chrome.storage.sync.set({ SET: s }, function() {
                    showemotes(); //update emote table
                    setswap(); //use changed emote set
                }); //save the changed set
            }
            else if (l == 2) {
                chrome.storage.sync.set({ HOSTS: s }, function() {
                    showhosts(); //update hostname table
                    listswap(); //use changed hostname set
                }); //save the changed set
            }
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
                    listremove(hostnames, i, btn, 2); //make button remove adjacent hostname
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
