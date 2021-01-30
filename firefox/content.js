(function() {
    var emotes = []; //array for emote objects
    chrome.storage.local.get(['SET'], function(result) { //get custom emotes at page load
        emotes = result.SET; //used saved emote set
    });

    var hostnames = []; //array for hostname objects
    chrome.storage.sync.get(['HOSTS'], function(result) { //get custom hostnames at page load
        hostnames = result.HOSTS; //used saved hostname set
    });

    function substitute(nodes) { //substitutes text patterns in generally visible text elements with assigned inline images
        var elements = nodes.querySelectorAll("span:not(.emote_wrapper):not(.tooltiptext), div:not(.tw-tooltip):not(.bttv-emote-tooltip):not(.ffz__tooltip--inner), p, h1, h2, h3, h4, h5, h6, a, b, strong, em, i, th, td, li, blockquote");
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

    var target = null;
    document.addEventListener("contextmenu", function(event) {
        target = event.target;
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { //menu actions
        if (request.order == "stop") { //switch extension off
            observer.disconnect(); //stop checking
        }
        else if (request.order == "start") { //switch extension on
            initiate();
        }
        if (request.newemotes == "change") { //use new custom emotes set
            chrome.storage.local.get(['SET'], function(result) {
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
        if (request.context == "add") {
            if (typeof target.alt !== "undefined") {
                sendResponse({ alt: target.alt, src: target.src });
            }
        }
    });
}());
