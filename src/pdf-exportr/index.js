//@flow
'use strict';

import {
    renderSitePhantom, 
    renderSiteNightmare
} from './render'
var upload = require('./uploadS3');

import type {RenderParams} from './render';

process.on('unhandledRejection', (reason, p: Promise) => {
    console.error('Unhandled Promise Rejection:', reason, p);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
});

function splitCookies(cookies: string): Object {
    var cookieValues = cookies.split(';');
    var cookieMap = {};
    for (var i = 0; i < cookieValues.length; i++) {
        var cookieNameValuePairs = cookieValues[i].split('=');
        cookieMap[cookieNameValuePairs[0].trim()] = cookieNameValuePairs[1].trim();
    }
    return cookieMap;
}

function parseParameters(event: AWSLambdaEvent, context: AWSLambdaContext): RenderParams {
    context.callbackWaitsForEmptyEventLoop = false;

    var params = {};
    var cookies = {};
    if(event.headers && event.headers.Cookie){
        cookies = splitCookies(event.headers.Cookie);
    }
    if(event.queryStringParameters){
        if(event.queryStringParameters.jwt)
            params.jwt = event.queryStringParameters.jwt;
        if(event.queryStringParameters.passCookies)
            params.cookies = cookies;
        if(event.queryStringParameters.path)
            params.path = event.queryStringParameters.path;
    }
    return params;
}

function exportPdf(event: AWSLambdaEvent, context: AWSLambdaContext, cb: AWSLambdaCallback, renderMethod: (params: RenderParams) => Buffer){
    context.callbackWaitsForEmptyEventLoop = false;
    let params = parseParameters(event, context);
    renderMethod(params).then(upload)
        .then((url: string) => {
            return cb(null,{ 
                statusCode: 200,
                body: JSON.stringify({url: url})
            });
        })
        .catch((error: Error)=>{
            return cb(null,{ 
                statusCode: 500,
                body: JSON.stringify({error: error})
            });
        });
}

// Your first function handler
function exportPdfNM(event, context, cb){
    exportPdf(event, context, cb, renderSiteNightmare);
}

function exportPdfPhantom(event, context, cb){
    exportPdf(event, context, cb, renderSitePhantom);
}

module.exports = { 
    exportPdfNM,
    exportPdfPhantom
};
