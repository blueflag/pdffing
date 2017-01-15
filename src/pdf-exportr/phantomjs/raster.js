/* global phantom */

"use strict";
require('phantomjs-polyfill');
import {Map} from 'immutable';
var page = require('webpage').create();
var system = require('system');

var requests = Map();

var address, output, size, pageWidth, pageHeight, orientation;
var program = require('minimist')(system.args);
var loaded = false;

if(!program.url || program.help || !program.file){
    console.log('--url [value]', '(Required) URL to open');
    console.log('--jwt [value]', 'JWT token to use for request');
    console.log('--file [value]', 'file to output to');
    console.log('--size [value]', 'paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter" image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('--zoom [value]', 'zoom page by %');
    console.log('--cookie [key=value]', 'add a cookie to the request.');
    phantom.exit(1);
}


/**
 * Parses a URL and returns the parts.
 */
function getLocation(href: string): Object {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    };
}

/**
 * Adds a cookie to the request.
 */
function addCookie(cookie){
    var re = /(.+)=(.+?)(?= \w+=|$)/gm;     
    var cookieParams = re.exec(cookie);
    if(!page.addCookie({
        'name': cookieParams[1],
        'value': cookieParams[2],
        'domain': getLocation(program.url).hostname,
        'path': '/'
    }, true)){
        console.error('Could not add cookie name: ', cookieParams[1], 'value: ', cookieParams[2])
    }
}

address = program.url;
output = program.file;
orientation = program.orientation;
page.viewportSize = { width: 600, height: 600 };
page.customHeaders = {};

if(program.jwt){
    page.customHeaders.Authorization = 'Bearer ' + program.jwt;
}

if(program.cookie){
    if (program.cookie.constructor == Array){
        for(var i = 0; i < program.cookie.length; i++){
            addCookie(program.cookie[i]);
        }
    }
    else {
        addCookie(program.cookie);
    }
    console.log('cookies : ', JSON.stringify(page.cookies));
} else {
    console.log('cookies : none');
}

if (program.size && output.substr(-4) === ".pdf") {
    size = program.size.split('*');
    page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                        : { format: program.size, orientation: orientation, margin: '1cm' };
} else if (program.size && program.size[3].substr(-2) === "px") {
    size = program.size[3].split('*');
    if (size.length === 2) {
        pageWidth = parseInt(size[0], 10);
        pageHeight = parseInt(size[1], 10);
        page.viewportSize = { width: pageWidth, height: pageHeight };
        page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
    } else {
        pageWidth = parseInt(program.size, 10);
        pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
        page.viewportSize = { width: pageWidth, height: pageHeight };
    }
}
if (program.zoom) {
    page.zoomFactor = program.zoom;
}


page.onPageCreated = function(newPage) {
    console.log('A new child page was created! Its requested URL is not yet available, though.');
    newPage.onClosing = function(closingPage) {
        console.log('A child page is closing: ' + closingPage.url);
    };
};

page.onLoadStarted = function() {
    var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
    console.log('Current page ' + currentUrl + ' will go...');
    console.log('Now loading a new page...');
};

page.onClosing = function(closingPage) {
    console.log('The page is closing! URL: ' + closingPage.url);
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};

page.onResourceError = function(resourceError) {
    console.error('Unable to load resource (#' + resourceError.id + ', URL:' + resourceError.url + ')');
    console.error('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    requests = requests.delete(resourceError.id);
};

page.onResourceReceived = function(response) {
    console.log('Response (#' + response.id + ', URL "' + response.url + '"): ');
    requests = requests.delete(response.id, response.url);
    if(requests.size === 0 && loaded){
        renderAndExit();
    }
};

page.onResourceRequested = function(requestData, networkRequest) {
    requests = requests.set(requestData.id, requestData.url);
};

page.onAlert = function(msg: string) {
    console.log(`ALERT: ${msg}`);
};

function renderAndExit(){
    console.log('Calling Render', requests.size, loaded);
    window.setTimeout(function () {
        page.render(output);
        phantom.exit();
    }, 200);
}

page.onLoadFinished = function (status) {
    console.log('Address Opened', address, status);
    if (status !== 'success') {
        console.error('Unable to load the address!');
        phantom.exit(1);
    } else {
        loaded = true;
        if(requests.size === 0){
            renderAndExit();
        }

    }
};

page.open(address);

