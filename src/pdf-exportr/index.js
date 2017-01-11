//@flow
'use strict';

import {
    renderSitePhantom, 
    renderSiteNightmare
} from './render';
var upload = require('./uploadS3');

import type {RenderParams} from './render';

process.on('unhandledRejection', (reason: Error | any, p: Promise<any>) => {
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
        params.paperSize = event.queryStringParameters.paperSize || 'A4'; 
        params.orientation = event.queryStringParameters.orientation || 'portrait'; 
    }
    return params;
}

function exportPdf(event: AWSLambdaEvent, context: AWSLambdaContext, cb: AWSLambdaCallback, renderMethod: (params: RenderParams) => Promise<Buffer>){
    context.callbackWaitsForEmptyEventLoop = false;
    let params = parseParameters(event, context);
    renderMethod(params).then(upload)
        .then((url: string) => {
            cb(null,{ 
                statusCode: 200,
                body: JSON.stringify({url: url})
            });
        })
        .catch((error: Error)=>{
            console.log('Error exporting pdf', error);
            cb(error);
        });
}

// Your first function handler
function exportPdfNM(event: AWSLambdaEvent, context: AWSLambdaContext, cb: AWSLambdaCallback){
    exportPdf(event, context, cb, renderSiteNightmare);
}

function exportPdfPhantom(event: AWSLambdaEvent, context: AWSLambdaContext, cb: AWSLambdaCallback){
    exportPdf(event, context, cb, renderSitePhantom);
}

module.exports = { 
    exportPdfNM,
    exportPdfPhantom
};
