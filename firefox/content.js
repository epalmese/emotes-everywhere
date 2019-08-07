(function() {
    var emotes = []; //array for emote objects
    chrome.storage.sync.get(['SET'], function(result) { //check for custom emotes at page load
        if (result.SET == null) { //if no emote set is saved
            emotes = [
                { code: "LUL", src: "https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0" },
                { code: "LULW", src: "https://cdn.frankerfacez.com/emoticon/139407/1" },
                { code: "OMEGALUL", src: "https://cdn.frankerfacez.com/emoticon/128054/1" },
                { code: "Pog", src: "https://cdn.frankerfacez.com/emoticon/210748/1" },
                { code: "PogChamp", src: "https://static-cdn.jtvnw.net/emoticons/v1/88/2.0" },
                { code: "WeirdChamp", src: "https://cdn.frankerfacez.com/emoticon/262468/1" },
                { code: "PogU", src: "https://cdn.frankerfacez.com/emoticon/256055/1" },
                { code: "POGGERS", src: "https://cdn.frankerfacez.com/emoticon/214129/1" },
                { code: "Pepega", src: "https://cdn.frankerfacez.com/emoticon/243789/1" },
                { code: "PepeHands", src: "https://cdn.frankerfacez.com/emoticon/231552/1" },
                { code: "PepeLaugh", src: "https://cdn.frankerfacez.com/emoticon/64785/1" },
                { code: "pepeJAM", src: "https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/1x" },
                { code: "monkaS", src: "https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x" },
                { code: "FeelsBadMan", src: "https://cdn.betterttv.net/emote/566c9fc265dbbdab32ec053b/1x" },
                { code: "FeelsGoodMan", src: "https://cdn.betterttv.net/emote/566c9fde65dbbdab32ec053e/1x" },
                { code: "FeelsOkayMan", src: "https://cdn.frankerfacez.com/emoticon/145947/1" },
                { code: "EZ", src: "https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/1x" },
                { code: "AYAYA", src: "https://cdn.frankerfacez.com/emoticon/162146/1" },
                { code: "4Head", src: "https://static-cdn.jtvnw.net/emoticons/v1/354/2.0" },
                { code: "Kreygasm", src: "https://static-cdn.jtvnw.net/emoticons/v1/41/2.0" },
                { code: "gachiBASS", src: "https://cdn.betterttv.net/emote/57719a9a6bdecd592c3ad59b/1x" },
                { code: "gachiGASM", src: "https://cdn.betterttv.net/emote/55999813f0db38ef6c7c663e/1x" },
                { code: "HandsUp", src: "https://cdn.frankerfacez.com/emoticon/229760/1" },
                { code: "Clap", src: "https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/2x" },
                { code: "D:", src: "https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/1x" }
            ]; //use default set
            chrome.storage.sync.set({ SET: emotes }); //save default set
        }
        else { //if an emote set is saved
            emotes = result.SET; //used saved emote set
        }
    });

    var hostnames = []; //array for hostname objects
    chrome.storage.sync.get(['HOSTS'], function(result) { //check for custom hostnames at page load
        if (result.HOSTS == null) { //if no hostname set is saved
            hostnames = [
                "www.twitch.tv",
                "www.reddit.com",
                "twitter.com"
            ]; //use default set
            chrome.storage.sync.set({ HOSTS: hostnames }); //save default set
        }
        else { //if a hostname set is saved
            hostnames = result.HOSTS; //used saved hostname set
        }
    });

    function substitute(nodes) { //substitutes text patterns in generally visible text elements with assigned inline images
        var elements = nodes.querySelectorAll("span:not(.emote_wrapper):not(.tooltiptext), div:not(.tw-tooltip), p, h1, h2, h3, h4, h5, h6, a, b, strong, em, i, th, td, li, blockquote");
        for (var i = 0; i < elements.length; i++) {
            for (var j = 0; j < elements[i].childNodes.length; j++) {
                var node = elements[i].childNodes[j];
                if (node.nodeType === 3) { //if the node is a text node
                    var text = node.nodeValue.split(" "); //split text by spaces
                    var new_node = document.createDocumentFragment();
                    for (var k = 0; k < text.length; k++) {
                        var found = false;
                        for (var l = 0; l < emotes.length; l++) {
                            if (text[k] == emotes[l].code) { //if emote match is found
                                found = true;
                                var wrapper = document.createElement("span");
                                wrapper.className = "emote_wrapper";
                                var icon = document.createElement("img");
                                icon.className = "inserted_emote";
                                icon.src = emotes[l].src; //emote image source
                                icon.alt = emotes[l].code; //alternate text (for copy/paste)
                                var tip = document.createElement("span");
                                tip.className = "tooltiptext";
                                tip.textContent = emotes[l].code;
                                wrapper.appendChild(icon);
                                wrapper.appendChild(tip);
                                new_node.appendChild(wrapper);
                                break; //break loop when a match is found (only one emote can match)
                            }
                        }
                        if (found == false) { //if no emote match has been found
                            new_node.appendChild(document.createTextNode(text[k])); //re-insert word
                        }
                        if (k < text.length - 1) { //miss last word
                            new_node.appendChild(document.createTextNode(" ")); //add a space
                        }
                    }
                    new_node.normalize(); //concatenate adjacent text nodes
                    elements[i].replaceChild(new_node, node); //replace text node with fragment including inserted emotes
                }
            }
        }
    }

    var observer = new MutationObserver(function(mutations) { //checks nodes that are subjected to change after initial page load
        mutations.forEach(function(mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                if (mutation.addedNodes[i].childNodes.length) {
                    substitute(mutation.addedNodes[i]); //subsequent substitutions
                }
            }
        });
    });

    function initiate() {
        var hn = window.location.hostname; //get hostname of frame
        for (var i = 0; i < hostnames.length; i++) {
            if (hn == hostnames[i]) { //if hostname included
                substitute(document.body); //activated substitution
                observer.observe(document.body, { //start checking
                    childList: true, subtree: true
                });
                break;
            }
        }
    }

    chrome.storage.sync.get(['ON'], function(result) { //check if the extension is on at page load
        if (result.ON == 1) {
            initiate();
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { //menu actions
        if (request.order == "stop") { //switch extension off
            observer.disconnect(); //stop checking
        }
        else if (request.order == "start") { //switch extension on
            initiate();
        }
        if (request.newemotes == "change") { //use new custom emotes set
            chrome.storage.sync.get(['SET'], function(result) {
                emotes = result.SET;
                chrome.storage.sync.get(['ON'], function(result) {
                    if (result.ON == 1) {
                        var hn = window.location.hostname; //get hostname of frame
                        for (var i = 0; i < hostnames.length; i++) {
                            if (hn == hostnames[i]) { //if hostname included
                                substitute(document.body); //activated substitution
                                break;
                            }
                        }
                    }
                });
            });
        }
        if (request.sitelist == "get") {
            if (window.top == window.self) {
                var hn = window.top.location.hostname; //get hostname of top frame
                sendResponse({ hostname: hn });
            }
        }
        if (request.sitelist == "edit") {
            chrome.storage.sync.get(['HOSTS'], function(result) {
                hostnames = result.HOSTS;
                chrome.storage.sync.get(['ON'], function(result) {
                    if (result.ON == 1) {
                        var hn = window.location.hostname; //get hostname of frame
                        var found = false;
                        for (var i = 0; i < hostnames.length; i++) {
                            if (hn == hostnames[i]) { //if hostname included
                                substitute(document.body); //activated substitution
                                observer.observe(document.body, { //start checking
                                    childList: true, subtree: true
                                });
                                found = true;
                                break;
                            }
                        }
                        if (found == false) {
                            observer.disconnect();
                        }
                    }
                });
            });
        }
    });
}());
