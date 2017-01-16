const proxyquire = require('proxyquire').noCallThru();
import test from 'ava';
import sinon from 'sinon';

test.cb('Exits with status 1 if program url is not defined.', (t: AssertContext) : void => {
    var args = [];
    global.phantom = {
        exit: (status: number) => {
            t.is(status, 1);
            t.end();            
        }
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => ({})
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
});


test.cb('Exits with status 1 if program file is not defined.', (t: AssertContext) : void => {
    var args = ['script.js', '--url', 'http://www.test.com'];
    global.phantom = {
        exit: (status: number) => {
            t.is(status, 1);
            t.end();
        }
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => ({})
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
});


test('Calls open on the page, for rendering', (t: AssertContext) : void => {
    var args = ['script.js', 
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    var openSpy = sinon.spy();
    global.phantom = {
        exit: () => {
        }
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => ({
                open: openSpy
            })
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(openSpy.calledWith('http://www.test.com'), true);
});


test('Sets JWT Authorization headers.', (t: AssertContext) : void => {
    var args = ['script.js', 
        '--jwt', 'TEST234',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    var openSpy = sinon.spy();
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {}
    }
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(page.customHeaders.Authorization, 'Bearer TEST234');
});


test('Sets Cookies if one is defined.', (t: AssertContext) : void => {
    var args = ['script.js',
        '--cookie', 'A=B',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    var addCookieSpy = sinon.spy();
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {},
        addCookie: addCookieSpy
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(addCookieSpy.calledWith({
        'name': 'A',
        'value': 'B',
        'domain': 'www.test.com',
        'path': '/'
    }), true);
});

test('Sets Cookies if multiple are defined.', (t: AssertContext) : void => {
    var args = ['script.js',
        '--cookie', 'A=B',
        '--cookie', 'C=D',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    var addCookieSpy = sinon.spy(()=>true);
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {},
        addCookie: addCookieSpy
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(addCookieSpy.calledWith({
        'name': 'A',
        'value': 'B',
        'domain': 'www.test.com',
        'path': '/'
    }), true);
    t.is(addCookieSpy.calledWith({
        'name': 'C',
        'value': 'D',
        'domain': 'www.test.com',
        'path': '/'
    }), true);
});


test('Sets zoom factor if defined ', (t: AssertContext) : void => {
    var args = ['script.js',
        '--zoom', '200%',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {}
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(page.zoomFactor, '200%');
});         


test('Sets paper size to a standard paper size', (t: AssertContext) : void => {
    var args = ['script.js',
        '--size', 'A4',
        '--zoom', '200%',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {}
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(page.paperSize.format, "A4");
});         

test('Sets default orientation to portrait', (t: AssertContext) : void => {
    var args = ['script.js',
        '--size', 'A4',
        '--zoom', '200%',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {}
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(page.paperSize.orientation, "portrait");
});

test('Accepts a size in w*h format', (t: AssertContext) : void => {
    var args = ['script.js',
        '--size', '800*600',
        '--zoom', '200%',
        '--url', 'http://www.test.com',
        '--file', 'output.pdf'];
    global.phantom = {
        exit: () => {
        }
    };
    var page = {
        open: () => {}
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    t.is(page.paperSize.width, "800");
    t.is(page.paperSize.height, "600");
});

{
    var args = ['script.js',
        '--size', '1920px',
        '--zoom', '200%',
        '--url', 'http://www.test.com',
        '--file', 'output.png'];
    global.phantom = {
        exit: () => {
        }
    };
    global.window = {
        location:{ 
            href: 'about:blank'
        }
    }
    var page = {
        open: () => {},
        evaluate: (cb) => cb()
    };
    proxyquire('../raster', {
        'webpage': {
            create: () => page
        },
        'system':{
            args: args
        },
        'phantomjs-polyfill':{}
    });
    test('Logs when a page error occurs', (t: AssertContext) : void => {
        sinon.spy(console, 'error');
        page.onError('Test Error', [{file: 'abc.js',line: 0,  function: 'abc()'}]);
        t.is(console.error.calledWith('ERROR: Test Error\nTRACE:\n -> abc.js: 0 (in function "abc()")'), true);
        console.error.restore();
    });
    test('Logs when a page error occurs without function', (t: AssertContext) : void => {
        sinon.spy(console, 'error');
        page.onError('Test Error', [{file: 'abc.js',line: 0}]);
        t.is(console.error.calledWith('ERROR: Test Error\nTRACE:\n -> abc.js: 0'), true);
        console.error.restore();
    });
    test('Logs page error even with no trace', (t: AssertContext) : void => {
        sinon.spy(console, 'error');
        page.onError('Test Error');
        t.is(console.error.calledWith('ERROR: Test Error'), true);
        console.error.restore();
    });
    test('Logs page alerts to the console', (t: AssertContext) : void => {
        sinon.spy(console, 'log');
        page.onAlert('Alerting');
        t.is(console.log.calledWith('ALERT: Alerting'), true);
        console.log.restore();
    });
    test('Logs a message when a page is closed', (t: AssertContext) : void => {
        sinon.spy(console, 'log');
        page.onClosing({url: 'www.test.com'});
        t.is(console.log.calledWith('The page is closing! URL: www.test.com'), true);
        console.log.restore();
    });
    test('Logs page alerts to the console', (t: AssertContext) : void => {
        sinon.spy(console, 'log');
        global.window = {
            location: { 
                href:'about:blank'
            } 
        };
        page.evaluate = (cb) => cb();
        page.onLoadStarted();
        t.is(console.log.calledWith('Current page about:blank will go...'), true);
        console.log.restore();
    });
    test('onLoadFinished - Calls render when page load is finished if no outstanding requests', (t: AssertContext) : void => {
        global.window = { 
            setTimeout: (cb) => cb() 
        };
        page.render = sinon.spy();
        page.onLoadFinished('success');
        t.is(page.render.calledOnce, true);
    });

    test('onLoadFinished - Calls exit when it renders', (t: AssertContext) : void => {
        global.phantom.exit = sinon.spy();
        global.window = { 
            setTimeout: (cb) => cb() 
        };
        page.render = sinon.spy();
        page.onLoadFinished('success');
        t.is(global.phantom.exit.calledOnce, true);
    });

    test('onLoadFinished - Does not call render while it has outstanding requests', (t: AssertContext) : void => {
        page.render = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onLoadFinished('success');
        t.is(page.render.callCount, 0);
    });



    test('onResourceReceived - Calls render if no oustanding requests', (t: AssertContext) : void => {
        global.window = { 
            setTimeout: (cb) => cb() 
        };
        page.render = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onLoadFinished('success');
        page.onResourceReceived({id: 1, url: 'http://test.com/image.png'});
        t.is(page.render.calledOnce, true);
    });

    test('onResourceReceived - Does not render if not yet loaded', (t: AssertContext) : void => {
        //Refresh loaded var by proxyquire again.
        proxyquire('../raster', {
            'webpage': {
                create: () => page
            },
            'system':{
                args: args
            },
            'phantomjs-polyfill':{}
        });
        page.render = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onResourceReceived({id: 1, url: 'http://test.com/image.png'});
        t.is(page.render.callCount, 0);
    });

    test('onResourceReceived - Does not render if not oustanding requests still exist', (t: AssertContext) : void => {
        page.render = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onLoadFinished('success');
        page.onResourceRequested({id: 2, url: 'http://test.com/image2.png'});
        page.onResourceReceived({id: 1, url: 'http://test.com/image.png'});
        t.is(page.render.callCount, 0);
    });

    test('onResourceError - Attempts to render if nothing left', (t: AssertContext) : void => {
        page.render = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onLoadFinished('success');
        page.onResourceError({id: 1, url: 'http://test.com/image.png', errorCode: 404, errorString: 'Not Found' });
        t.is(page.render.callCount, 0);
    });

    test('onLoadFinished - Exits if page cannot be loaded.', (t: AssertContext) : void => {
        global.phantom.exit = sinon.spy();
        page.onResourceRequested({id: 1, url: 'http://test.com/image.png'});
        page.onLoadFinished('error');
        t.is(global.phantom.exit.calledWith(1), true);
    });
}