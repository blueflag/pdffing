import test from 'ava';
import sinon from 'sinon';
const proxyquire = require('proxyquire').noCallThru();


test('preload - Creates XMLHttpRequest that counts', (t: AssertContext) : void => {
    function XMLHttpRequest(){}
    XMLHttpRequest.DONE = 1;
    XMLHttpRequest.NOT_DONE = 2;
    XMLHttpRequest.prototype.send = function(){};
    XMLHttpRequest.prototype.onreadystatechange = function(){};

    global.XMLHttpRequest = XMLHttpRequest;
    global.window = {};
    global.__nightmare = {};

    proxyquire('../preload', {
        'electron' : {
            ipcRenderer: {}
        }
    });

    var xhttp = new XMLHttpRequest();
    xhttp.send();

    t.is(XMLHttpRequest.prototype.outstanding_length, 1);
    xhttp.readyState = XMLHttpRequest.DONE;
    xhttp.onreadystatechange();
    t.is(XMLHttpRequest.prototype.outstanding_length, 0);

    delete global.window;
    delete global.__nightmare;
    delete global.XMLHttpRequest;
});

test('preload - Still runs if readyState is not done', (t: AssertContext) : void => {
    function XMLHttpRequest(){}
    XMLHttpRequest.DONE = 1;
    XMLHttpRequest.NOT_DONE = 2;
    XMLHttpRequest.prototype.send = function(){};
    XMLHttpRequest.prototype.onreadystatechange = function(){};
    global.XMLHttpRequest = XMLHttpRequest;
    global.window = {};
    global.__nightmare = {};

    proxyquire('../preload', {
        'electron' : {
            ipcRenderer: {}
        }
    });

    var xhttp = new XMLHttpRequest();
    xhttp.send();

    t.is(XMLHttpRequest.prototype.outstanding_length, 1);
    xhttp.readyState = XMLHttpRequest.NOT_DONE;
    xhttp.onreadystatechange();
    t.is(XMLHttpRequest.prototype.outstanding_length, 1);

    delete global.window;
    delete global.__nightmare;
    delete global.XMLHttpRequest;
});