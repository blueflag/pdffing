// @flow

import test from 'ava';
import sinon from 'sinon';
const proxyquire = require('proxyquire').noCallThru();
// console.log(index);
// const DEFAULT_PARAMS = {
//     callbackWaitsForEmptyEventLoop: false
// };

const UPLOAD_S3_DEFAULT = () => Promise.resolve();

test('exportPdfPhantom calls phantom render menthod', (t: AssertContext) : void => {
    const httpEvent = {};
    var renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    var index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({}));
});

test('exportPdfPhantom - sets jwt if defined', (t: AssertContext) : void => {
    const httpEvent = {
        queryStringParameters: {
            jwt: 'TEST_TOKEN'
        }
    };
    var renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    var index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({
        jwt: 'TEST_TOKEN'
    }));
});

test('exportPdfPhantom - passes cookies if asked', (t: AssertContext) : void => {
    const httpEvent = {
        headers:{
            Cookie: 'testCookie1=321; testCookie2=123'
        },
        queryStringParameters: {
            passCookies: true
        }
    };
    const renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });

    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({
        cookies: {
            testCookie1: "321", testCookie2: "123"
        }
    }));
});


test('exportPdfPhantom - passes path', (t: AssertContext) : void => {
    const httpEvent = {
        queryStringParameters: {
            path: '/test/test'
        }
    };
    const renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    
    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({
        path: '/test/test'
    }));
});

test('exportPdfPhantom - passes paperSize', (t: AssertContext) : void => {
    const httpEvent = {
        queryStringParameters: {
            paperSize: 'A4'
        }
    };
    const renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    
    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({
        paperSize: 'A4'
    }));
});

test('exportPdfPhantom - passes paperSize', (t: AssertContext) : void => {
    const httpEvent = {
        queryStringParameters: {
            orientation: 'landscape'
        }
    };
    const renderSitePhantomSpy = sinon.spy(() => Promise.resolve());
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: renderSitePhantomSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    
    index.exportPdfPhantom(httpEvent, {}, ()=>{});
    t.true(renderSitePhantomSpy.calledOnce);
    t.true(renderSitePhantomSpy.calledWith({
        orientation: 'landscape'
    }));
});


test('exportPdfPhantom - returns url on success', (t: AssertContext) : Promise<void> => {
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: () => Promise.resolve()
        },
        './uploadS3' : () => Promise.resolve('http://www.test.com')
    });
    return new Promise((resolve: (result: void) => void, reject: (error: Error) => void) => {
        index.exportPdfPhantom({}, {}, (err: Error, data: any)=>{
            try{
                t.is(data.body, JSON.stringify({url: 'http://www.test.com'}));
                resolve();
            }
            catch(e){
                reject(e);
            }
        });
    });
});


test('exportPdfPhantom - returns error on error', (t: AssertContext) : Promise<void> => {
    const index = proxyquire('../index', {
        './render' : {
            renderSitePhantom: () => Promise.resolve()
        },
        './uploadS3' : () => Promise.reject(new Error('Test Message'))
    });
    return new Promise((resolve: (result: void) => void, reject: (error: Error) => void) => {
        index.exportPdfPhantom({}, {}, (err: Error)=>{
            try{
                t.is(err.message, 'Test Message');
                resolve();
            }
            catch(e){
                reject(e);
            }
        });
    });
});

test('exportPdfNM - calls renderSiteNightmare', (t: AssertContext) : void => {
    const httpEvent = {
    };
    const renderSiteNightmareSpy = sinon.spy(() => Promise.resolve());
    const index = proxyquire('../index', {
        './render' : {
            renderSiteNightmare: renderSiteNightmareSpy
        },
        './uploadS3' : UPLOAD_S3_DEFAULT
    });
    
    index.exportPdfNM(httpEvent, {}, ()=>{});
    t.true(renderSiteNightmareSpy.calledOnce);
    t.true(renderSiteNightmareSpy.calledWith({}));
});


// test('graphqlApi should execute the graphql query even if no variables are provided', (t: AssertContext): void => {


//     const callback = (err: Error, result: Object): void => {
//         if (err) {
//             return t.fail();
//         }

//         t.is(TOKEN_PAYLOAD.username, result.body.data.viewer.username);
//     };

//     return graphqlApi(httpEvent, LAMBDA_CONTEXT, callback);
// });

// test('graphqlApi should complain if no query is provided', (t: AssertContext): void => {
//     const httpEvent = {
//         body: '{}',
//         headers: {
//             Authorization: JWT
//         }
//     };

//     const callback = (err: Error, regsult: Object) => {
//         t.ifError(err);
//         t.true(result.statusCode >= 400);
//         t.true(result.body.errors.length > 0);
//     };

//     return graphqlApi(httpEvent, LAMBDA_CONTEXT, callback);
// });

// test('graphqlApi should catch any graphql errors', (t: AssertContext): void => {
//     const httpEvent = {
//         body: JSON.stringify({
//             query: 'query { viewer { username } }'
//         }),
//         headers: {
//             Authorization: JWT
//         }
//     };

//     const callback = (err: Error, result: Object) => {
//         if (result.statusCode === 500) {
//             t.pass();
//         }
//         else {
//             throw new Error('Fail the request on purpose!!');
//         }
//     };

//     return graphqlApi(httpEvent, LAMBDA_CONTEXT, callback);
// });
