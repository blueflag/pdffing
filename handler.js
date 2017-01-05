'use strict';
var render = require('./render');
var upload = require('./uploadS3');

function splitCookies(cookies){
    var cookieValues = cookies.split(';');
    var cookieMap = {};
    for (var i = 0; i < cookieValues.length; i++) {
        var cookieNameValuePairs = cookieValues[i].split('=');
        cookieMap[cookieNameValuePairs[0].trim()] = cookieNameValuePairs[1].trim();
    }
    return cookieMap;
}

// Your first function handler
 function hello(event, context, cb){
    var params = {}
    var cookies = {}
    if(event.headers && event.headers.Cookie){
        cookies = splitCookies(event.headers.Cookie);
    }
    if(event.queryStringParameters){
        if(event.queryStringParameters.jwt)
            params.jwt = event.queryStringParameters.jwt
        if(event.queryStringParameters.passCookies)
            params.cookies = cookies
    }
    render(params).then(upload).then(function(url){
        return cb(null,{ 
            statusCode: 200,
            body: JSON.stringify({url: url})
        });
    })
}

module.exports.hello = hello
// You can add more handlers here, and reference them in serverless.yml
