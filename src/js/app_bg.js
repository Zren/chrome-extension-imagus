// » header

"use strict";

var app, cfg, Tabs, Port;

if (location.hash) {
    app = location.hash.slice(1).split(",");
    app = {
        name: app[0],
        version: app[1],
    };
}

try {
    void chrome.storage.local;
    var platform = this.browser ? "firefox" : "chrome";
} catch (ex) {
    var platform = "edge";
    this.chrome = this.browser;
}

app = chrome.runtime.getManifest();
app = {
    name: app.name,
    version: app.version,
};

cfg = {
    migrateOldStorage: function (keys, callback) {
        if (localStorage.hz) {
            var itemsToStore = {};

            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                itemsToStore[key] = JSON.parse(localStorage.getItem(key));
            }

            this.set(itemsToStore, function () {
                localStorage.clear();
                callback();
            });
            return;
        }

        callback();
    },

    get: function (keys, callback) {
        chrome.storage.local.get(keys, function (items) {
            for (var key in items) {
                try {
                    if (!items[key]) {
                        throw Error;
                    }

                    items[key] = JSON.parse(items[key]);
                } catch (ex) {
                    delete items[key];
                }
            }

            callback(items);
        });
    },

    set: function (items, callback) {
        for (var key in items) {
            // Use JSON.stringify in order to keep key order in objects,
            // as Chrome sorts it
            items[key] = JSON.stringify(items[key]);
        }

        chrome.storage.local.set(items, callback);
    },

    remove: function (keys) {
        chrome.storage.local.remove(keys);
    },
};

Tabs = {};
Tabs.create = chrome.tabs.create;

Port = {
    parse_msg: function (msg, origin, postMessage) {
        return {
            msg: msg,
            origin: origin.url,
            postMessage: postMessage,
            isPrivate: origin.tab.incognito,
        };
    },
    listen: function (fn) {
        if (this.listener)
            chrome.runtime.onMessage.removeListener(this.listener);
        this.listener = fn;
        chrome.runtime.onMessage.addListener(fn);
    },
};

var to_fromHistory =
    chrome.history &&
    function (url, removeIfVisited) {
        if (removeIfVisited) {
            chrome.history.getVisits({ url: url }, function (visits) {
                chrome.history[(visits.length ? "delete" : "add") + "Url"]({
                    url: url,
                });
            });
        } else {
            chrome.history.addUrl({ url: url });
        }
    };

window.saveURI = function (details) {
    if (!details || !details.url) {
        return;
    }
    var url = details.url;
    var path = details.path;
    if (path) {
        if (path.slice[-1] != "/") path += "/";
    } else {
        path = "";
    }
    if (platform !== "firefox") {
        var decidename = function (item, suggest) {
            if (
                !item.filename.includes(".") ||
                !item.filename.match(
                    /(apng|avif|bmp|gif|jpg|jpeg|png|svg|tiff|webp|aac|mid|midi|mp3|ogg|opus|wav|webm|mp4|mpeg|ogv)/i
                )
            ) {
                var change = true;
                var filename = item.filename.match(/([^\.])+/)[1];
                var ext = details.priorityExt;
                if (!ext) {
                    fetch(url, {
                        method: "HEAD",
                    })
                        .then((response) =>
                            response.headers.get("Content-Type")
                        )
                        .then((x) => {
                            var mimeToExtension = {
                                // images
                                "image/apng": "apng",
                                "image/avif": "avif",
                                "image/bmp": "bmp",
                                "image/gif": "gif",
                                "image/jpeg": "jpg",
                                "image/png": "png",
                                "image/svg+xml": "svg",
                                "image/tiff": "tiff",
                                "image/webp": "webp",

                                // audio
                                "audio/aac": "aac",
                                "audio/midi": "mid",
                                "audio/mpeg": "mp3",
                                "audio/ogg": "ogg",
                                "audio/opus": "opus",
                                "audio/wav": "wav",
                                "audio/webm": "webm",

                                // video
                                "video/mp4": "mp4",
                                "video/mpeg": "mpeg",
                                "video/ogg": "ogv",
                                "video/webm": "webm",
                            };
                            ext = mimeToExtension[x];
                        })
                        .catch((ext = details.ext));
                }
                if (!ext) ext = details.ext;
                filename += "." + ext;
            }
            if (path || change) {
                if (!change) var filename = item.filename;
                suggest({ filename: path + filename });
            }
            chrome.downloads.onDeterminingFilename.removeListener(decidename);
        };
        chrome.downloads.onDeterminingFilename.addListener(decidename);
        var options = { url: url };
        if (path) {
            options.saveAs = false;
        }
        chrome.downloads.download(options);
    } else {
        var options = {
            url: url,
            headers: [
                {
                    name: "Referer",
                    value: url,
                },
            ],
        };

        if (path) {
            options.saveAs = false;
        }
        if (details.isPrivate) {
            options.incognito = details.isPrivate;
        }
        var listener = function (dl) {
            chrome.downloads.onCreated.removeListener(listener);
            if (
                !dl.filename.includes(".") ||
                !dl.filename.match(
                    /(apng|avif|bmp|gif|jpg|jpeg|png|svg|tiff|webp|aac|mid|midi|mp3|ogg|opus|wav|webm|mp4|mpeg|ogv)/i
                )
            ) {
                var change = true;
                var ext = details.priorityExt;
                if (!ext) {
                    fetch(url, {
                        method: "HEAD",
                    })
                        .then((response) =>
                            response.headers.get("Content-Type")
                        )
                        .then((x) => {
                            var mimeToExtension = {
                                // images
                                "image/apng": ".apng",
                                "image/avif": ".avif",
                                "image/bmp": ".bmp",
                                "image/gif": ".gif",
                                "image/jpeg": ".jpg",
                                "image/png": ".png",
                                "image/svg+xml": ".svg",
                                "image/tiff": ".tiff",
                                "image/webp": ".webp",

                                // audio
                                "audio/aac": ".aac",
                                "audio/midi": ".mid",
                                "audio/mpeg": ".mp3",
                                "audio/ogg": ".ogg",
                                "audio/opus": ".opus",
                                "audio/wav": ".wav",
                                "audio/webm": ".webm",

                                // video
                                "video/mp4": ".mp4",
                                "video/mpeg": ".mpeg",
                                "video/ogg": ".ogv",
                                "video/webm": ".webm",
                            };
                            ext = mimeToExtension[x];
                        })
                        .catch((ext = details.ext));
                }
                if (!ext) ext = "." + details.ext;
                if (ext[0] !== ".") ext = "." + ext;
                options.filename =
                    path + dl.filename.match(/([^\/\\\.]+)(?:\..*)?$/)[1] + ext;
            }
            if (path || change) {
                chrome.downloads.cancel(dl.id);
                chrome.downloads.erase({ id: dl.id });

                if (!change)
                    options.filename =
                        path + dl.filename.match(/([^\/\\]+)$/)[1];
                chrome.downloads.download(options);
            }
        };
        chrome.downloads.onCreated.addListener(listener);
        browser.downloads.download(options);
    }
};
