// TODO: Allow configuring, or re-use sieve
let needsTarget = new Set(['webmshare\.com\/', 'i\\d+\.vipr\\.im\/', '\.imagetwist\.com\/']);
let needsRemove = new Set(['sankakucomplex\\.com']);
let needsCustom = new Map([
    ['tiktokcdn\\.com', 'https://www\\.tiktok\\.com']
]);
let needsBypassCORS = new Set(['\.cdninstagram.com\/']);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    let shouldRemove = false;
    let shouldSetTarget = false;
    let shouldSetCustom = false;
    let newReferer = '';
    for (let rule of needsTarget.values()) {
        let regex = new RegExp(rule);
        if (regex.test(details.url)) {
            shouldSetTarget = true;
            newReferer = details.url;
            break;
        }
    }
    if (!shouldSetTarget) {
        for (const rule of needsRemove.values()) {
            let regex = new RegExp(rule);
            if (regex.test(details.url)) {
                shouldRemove = true;
                break;
            }
        }
    }

    if (!shouldRemove && !shouldSetTarget) {
        for (const [rule, value] of needsCustom.entries()) {
            let regex = new RegExp(rule);
            if (regex.test(details.url)) {
                shouldSetCustom = true;
                custom = value;
                break;
            }
        }
    }

    var headers = details.requestHeaders;
    if (!shouldRemove && !shouldSetTarget && !shouldSetCustom) {
        return {requestHeaders: headers};
    }

    // Strip out referer
    var newHeaders = [];
    for(var i = 0, l = headers.length; i < l; ++i) {
        if (bypassCORS && headers[i].name.toLowerCase() == 'cross-origin-resource-policy') {
            continue;
        }
        if (headers[i].name.toLowerCase() != 'referer') {
            newHeaders.push(headers[i]);
            continue;
        }
    }

    if (!shouldRemove) {
        newHeaders.push({
            name: "Referer",
            value: newReferer
        });
    }

    details.requestHeaders = newHeaders
    return {requestHeaders: newHeaders};
}, { urls: [ "<all_urls>" ] }, ['requestHeaders','blocking','extraHeaders']);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
    let bypassCORS = false;
    for (let rule of needsBypassCORS.values()) {
        let regex = new RegExp(rule);
        if (regex.test(details.url)) {
            bypassCORS = true;
            break;
        }
    }
    var headers = details.responseHeaders;
    if (!bypassCORS) {
        return {responseHeaders: headers};
    }
    var newHeaders = [];
    for(var i = 0, l = headers.length; i < l; ++i) {
        if (headers[i].name.toLowerCase() == 'cross-origin-resource-policy') {
            continue;
        }
        newHeaders.push(headers[i]);
    }
    details.responseHeaders = newHeaders
    return {responseHeaders: newHeaders};
}, { urls: [ "<all_urls>" ] }, ['responseHeaders', 'blocking', 'extraHeaders']);
