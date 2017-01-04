'use strict';
var render = require('./render');
var upload = require('./uploadS3');

// Your first function handler
 function hello(event, context, cb){
    var params = {}
    if(event.queryStringParameters){
        params = {
            jwt : event.queryStringParameters.jwt
        }
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
