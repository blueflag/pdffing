const proxyquire = require('proxyquire').noCallThru();
import test from 'ava';
import sinon from 'sinon';


test('renderSitePhantom - spawns childprocess with args.', (t: AssertContext) : void => {
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:() => {

        }
    }));
    var {renderSitePhantom, SITE} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        }
    });
    renderSitePhantom({}).then(() => {
    });
    var expectedArgs = [
        'joined_path',
        '--url',
        SITE,
        '--file',
        'joined_path',
        '--size',
        'A4',
        '--orientation',
        'landscape'

    ];
    t.is(spawnSpy.calledOnce, true);
    t.is(spawnSpy.calledWith('path', expectedArgs), true);
    
});


test('renderSitePhantom - takes params and sends as args.', (t: AssertContext) : void => {
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:() => {

        }
    }));
    var {renderSitePhantom, SITE} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        }
    });
    renderSitePhantom({
        paperSize: 'A3',
        orientation: 'portrait',
        path: 'test',
        jwt: 'TOKEN'
    }).then(() => {
    });
    var expectedArgs = [
        'joined_path',
        '--url',
        `${SITE}test`,
        '--file',
        'joined_path',
        '--size',
        'A3',
        '--orientation',
        'portrait',
        '--jwt',
        'TOKEN'
    ];
    t.is(spawnSpy.calledOnce, true);
    t.is(spawnSpy.calledWith('path', expectedArgs), true);
   
});

test('renderSitePhantom - adds cookies to args', (t: AssertContext) : void => {
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:() => {

        }
    }));
    var {renderSitePhantom, SITE} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        }
    });
    renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    }).then(() => {
    });
    var expectedArgs = [
        'joined_path',
        '--url',
        `${SITE}`,
        '--file',
        'joined_path',
        '--size',
        'A4',
        '--orientation',
        'landscape',
        '--cookie',
        'A=B',
        '--cookie',
        'C=D'
    ];
    t.is(spawnSpy.calledOnce, true);
    t.is(spawnSpy.calledWith('path', expectedArgs), true);
});

test('renderSitePhantom - after process completes it reads the file and returns the buffer', (t: AssertContext) : void => {
    var onCloseCb;
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:(type: string, cb: (any)) => {
            if(type === 'close')
                onCloseCb = cb;
        }
    }));
    var {renderSitePhantom} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null, 'FAKE_DATA');
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        }
    });
    var promise = renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    }).then((param: any): any => {
        return param;
    });
    onCloseCb(0);
    return promise.then((data: any) => {
        t.is(data,'FAKE_DATA');
    });
});


test('renderSitePhantom - rejects with error on non 0 return code', (t: AssertContext) : void => {
    var onCloseCb;
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:(type: string, cb: (any)) => {
            if(type === 'close')
                onCloseCb = cb;
        }
    }));
    var {renderSitePhantom} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null, 'FAKE_DATA');
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        }
    });
    var promise = renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    }).then((param: any): any => {
        return param;
    });
    onCloseCb(1);
    return promise.catch((err: Error) => {
        t.is(err.message,'Error executing process');
    });
});


test('renderSitePhantom - rejects with error if reading file fails', (t: AssertContext) : void => {
    var onCloseCb;
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: () => {}
        },
        stderr: {
            on: () => {}
        }, 
        on:(type: string, cb: (any)) => {
            if(type === 'close')
                onCloseCb = cb;
        }
    }));
    var {renderSitePhantom} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(new Error('FAKE_ERROR'));
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        }
    });
    var promise = renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    }).then((param: any): any => {
        return param;
    });
    onCloseCb(0);
    return promise.catch((err: Error) => {
        t.is(err.message,'FAKE_ERROR');
    });
});


test('renderSitePhantom - logs messages on STDOUT from phantom', (t: AssertContext) : void => {
    
    var errorSpy = sinon.spy(console, 'error');
    var logSpy = sinon.spy(console, 'log');

    var onCloseCb;
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: (type, cb) => {
                cb('test');
            }
        },
        stderr: {
            on: (type, cb) => {
                cb('test');
            }
        }, 
        on:(type: string, cb: (any)) => {
            if(type === 'close')
                onCloseCb = cb;
        }
    }));
    var {renderSitePhantom} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(new Error('FAKE_ERROR'));
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        }
    });
    renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    })
    .then((param: any): any => {
        return param;
    });
    t.is(logSpy.calledWith('phantom: test'), true);
    t.is(errorSpy.calledWith('phantom: test'), true);
    logSpy.restore();
    errorSpy.restore();
});

test('renderSitePhantom - Resolves with the data from the read.', (t: AssertContext) : void => {
    
    var errorSpy = sinon.spy(console, 'error');
    var logSpy = sinon.spy(console, 'log');

    var onCloseCb;
    var spawnSpy = sinon.spy(() => ({
        stdout: {
            on: (type, cb) => {
            }
        },
        stderr: {
            on: (type, cb) => {
            }
        }, 
        on:(type: string, cb: (any)) => {
            if(type === 'close')
                onCloseCb = cb;
        }
    }));
    var unlinkError = new Error('UNLINK ERROR');
    var {renderSitePhantom} = proxyquire('../render', {
        'child_process': {
            spawn: spawnSpy
        },
        'phantomjs-prebuilt':{
            path: "path"
        },
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null, {});
            },
            unlink: (path: string, cb) => {
                cb(unlinkError);
            }
        }
    });
    renderSitePhantom({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    })
    .then((param: any): any => {
        return param;
    });
    onCloseCb(0);
    t.is(errorSpy.calledWith(unlinkError), true);
    logSpy.restore();
    errorSpy.restore();
});


test('renderSiteNightmare - after process completes it reads the file and returns the buffer', (t: AssertContext) : void => {
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(){
                return this;
            },
            wait: function(){
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: function(){}
            }
        });
    };
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null, 'FAKE_DATA');
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        },
        'nightmare':nightmareMock
    });
    return renderSiteNightmare({
    })
    .then((param: any): any => {
        t.is(param, 'FAKE_DATA');
        return param;
    });
});


test('renderSiteNightmare - after process completes it returns an error if readfile fails', (t: AssertContext) : void => {
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(){
                return this;
            },
            wait: function(){
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: function(){}
            }
        });
    };
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb('FAKE_ERROR');
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        },
        'nightmare':nightmareMock
    });
    return renderSiteNightmare({
    })
    .catch((param: any): any => {
        t.is(param, 'FAKE_ERROR');
        return param;
    });
});

test('renderSiteNightmare - logs an error if file delete fails', (t: AssertContext) : void => {
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(){
                return this;
            },
            wait: function(param){
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: function(){}
            }
        });
    };
    
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null);
            },
            unlink: (path: string, cb) => {
                cb('FAKE_ERROR');
            }
        },
        'nightmare':nightmareMock
    });
    sinon.spy(console, 'error');
    return renderSiteNightmare({})
        .then((): any => {
            t.is(console.error.calledWith('FAKE_ERROR'), true);
            console.error.restore();
            return;
        });
});

test('renderSiteNightmare - Puts cookies in the cookies map', (t: AssertContext) : void => {
    var setSpy = sinon.spy((cookie) => nightmareMock());
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(){
                return this;
            },
            wait: function(){
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: setSpy
            }
        });
    };
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null, 'FAKE_DATA');
            },
            unlink: (path: string, cb) => {
                cb(null);
            }
        },
        'nightmare':nightmareMock
    });
    return renderSiteNightmare({
        cookies: {
            'A' : 'B',
            'C' : 'D'
        }
    })
    .then((param: any): any => {
        t.is(setSpy.calledWith({
            name: 'A', 
            value:'B', 
            url: 'http://toyotainstituteaustralia.com.au/'
        }), true);
        t.is(setSpy.calledWith({
            name: 'C', 
            value:'D', 
            url: 'http://toyotainstituteaustralia.com.au/'
        }), true);
        return param;
    });
});

test.cb('renderSiteNightmare - waits for XMLHttpRequest to be empty', (t: AssertContext) : void => {
    global.XMLHttpRequest = {
        outstanding_length: 2
    };
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(){
                return this;
            },
            wait: function(param){
                if(typeof param === 'function'){
                    t.is(param(), false);
                    t.end();
                }
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: function(){}
            }
        });
    };
    
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null);
            },
            unlink: (path: string, cb) => {
                cb('FAKE_ERROR');
            }
        },
        'nightmare':nightmareMock
    });
    renderSiteNightmare({})
        .then((): any => {
            return;
        });
});

test('renderSiteNightmare - logs console errors', (t: AssertContext) : void => {
    global.XMLHttpRequest = {
        outstanding_length: 2
    };
    var nightmareMock = function(){
        return ({
            goto: function(){
                return this;
            },
            on: function(command, cb){
                if(command === 'console')
                    cb('test console log');
                return this;
            },
            wait: function(param){
                return this;
            },
            pdf: function(){
                return this;
            },
            then: function(cb){
                cb();
                return this;
            },
            cookies: {
                set: function(){}
            }
        });
    };
    
    var {renderSiteNightmare} = proxyquire('../render', {
        'shortid':{
            generate: () => 'shortid'
        },
        'path':{
            join: () => 'joined_path',
            resolve: () => 'resolved_path'
        },
        'fs': {
            readFile: (path: string, cb) => {
                cb(null);
            },
            unlink: (path: string, cb) => {
                cb('FAKE_ERROR');
            }
        },
        'nightmare':nightmareMock
    });
    sinon.spy(console, 'log');
    return renderSiteNightmare({})
        .then((): any => {
            t.is(console.log.calledWith('test console log'), true);
            console.log.restore();
            return;
        });
});