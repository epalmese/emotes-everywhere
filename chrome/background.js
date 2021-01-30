(function() {
    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason == "install") {
            chrome.storage.local.get(['SET'], function(result) { //check for custom emotes at install
                if (result.SET == null) { //if no emote set is saved
                    var emotes = [
                        { code: "LUL", src: "https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0" },
                        { code: "LULW", src: "https://cdn.frankerfacez.com/emoticon/139407/1" },
                        { code: "OMEGALUL", src: "https://cdn.frankerfacez.com/emoticon/128054/1" },
                        { code: "Pog", src: "https://cdn.frankerfacez.com/emoticon/210748/1" },
                        { code: "PogU", src: "https://cdn.frankerfacez.com/emoticon/256055/1" },
                        { code: "WeirdChamp", src: "https://cdn.frankerfacez.com/emoticon/262468/1" },
                        { code: "POGGERS", src: "https://cdn.frankerfacez.com/emoticon/214129/1" },
                        { code: "Pepega", src: "https://cdn.frankerfacez.com/emoticon/243789/1" },
                        { code: "PepeHands", src: "https://cdn.frankerfacez.com/emoticon/231552/1" },
                        { code: "PepeLaugh", src: "https://cdn.frankerfacez.com/emoticon/64785/1" },
                        { code: "pepeJAM", src: "https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/1x" },
                        { code: "EZ", src: "https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/1x" },
                        { code: "FeelsBadMan", src: "https://cdn.betterttv.net/emote/566c9fc265dbbdab32ec053b/1x" },
                        { code: "FeelsOkayMan", src: "https://cdn.frankerfacez.com/emoticon/145947/1" },
                        { code: "FeelsStrongMan", src: "https://cdn.frankerfacez.com/emote/64210/1" },
                        { code: "monkaS", src: "https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x" },
                        { code: "Sadge", src: "https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/1x" },
                        { code: "BOOBA", src: "https://cdn.betterttv.net/emote/5fa99424eca18f6455c2bca5/1x" },
                        { code: "YEP", src: "https://cdn.frankerfacez.com/emote/418189/1" },
                        { code: "NOPERS", src: "https://cdn.betterttv.net/emote/5ec39a9db289582eef76f733/1x" },
                        { code: "widepeepoHappy", src: "https://cdn.frankerfacez.com/emote/270930/1" },
                        { code: "AYAYA", src: "https://cdn.frankerfacez.com/emoticon/162146/1" },
                        { code: "catJAM", src: "https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/1x" },
                        { code: "HandsUp", src: "https://cdn.frankerfacez.com/emoticon/229760/1" },
                        { code: "forsenCD", src: "https://cdn.frankerfacez.com/emote/249060/1" },
                        { code: "4Head", src: "https://static-cdn.jtvnw.net/emoticons/v1/354/2.0" },
                        { code: "5Head", src: "https://cdn.frankerfacez.com/emote/239504/1" },
                        { code: "KKonaW", src: "https://cdn.betterttv.net/frankerfacez_emote/164480/1" },
                        { code: "Clap", src: "https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/2x" },
                        { code: "D:", src: "https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/1x" }
                    ];
                    chrome.storage.local.set({ SET: emotes }); //save default set
                }
            });
            chrome.storage.sync.get(['HOSTS'], function(result) { //check for custom hostnames at install
                if (result.HOSTS == null) { //if no hostname set is saved
                    var hostnames = [
                        "www.twitch.tv",
                        "www.reddit.com",
                        "twitter.com",
                        "clips.twitch.tv"
                    ];
                    chrome.storage.sync.set({ HOSTS: hostnames }); //save default set
                }
            });
        }
    });

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({ //add an option to the context menu
        title: "Add to Emotes Everywhere",
        id: "imagetoemote",
        contexts: ["image"],
        documentUrlPatterns: ["https://*.twitch.tv/*"] //sites the context menu option will appear on
    });

    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        if (info.menuItemId == "imagetoemote") {
            chrome.tabs.sendMessage(tab.id, { context: "add" }, function(target) {
                var src = target.src;
                var alt = target.alt;
                if (alt.match("^[A-Za-z0-9:_]+$")) {
                    chrome.storage.local.get(['SET'], function(result) { //check for custom emotes
                        var emotes = result.SET;
                        var found = false;
                        for (var i = 0; i < emotes.length; i++) {
                            if (alt == emotes[i].code) {
                                found = true;
                                emotes[i].src = src; //overwrite
                                break;
                            }
                        }
                        if (found == false) {
                            emotes.push({ code: alt, src: src }); //add
                        }
                        chrome.storage.local.set({ SET: emotes }, function() { //save the changed set
                            chrome.tabs.query({}, function(tabs) { //use changed emote set in current tabs
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, { newemotes: "change" });
                                }
                            });
                        });
                    });
                }
            });
        }
    });
}());
