import {APIGatewayProxyEvent} from 'aws-lambda';
import {Dictionary, PaperSize, Orientation, RenderParams} from '../types';

const authHeader = 'Authorization';
const tokenStart = 'Bearer ';


function splitCookies(cookies: string): Dictionary<string>{
    const cookieValues: Array<string> = cookies.split(';');
    const cookieMap: Dictionary<string> = {};
    for (let i = 0; i < cookieValues.length; i++) {
        const cookieNameValuePairs: Array<string> = cookieValues[i].split('=');
        cookieMap[cookieNameValuePairs[0].trim()] = cookieNameValuePairs[1].trim();
    }
    return cookieMap;
}

function parseParameters(event: APIGatewayProxyEvent): RenderParams {
    if(!event.queryStringParameters) { 
        throw new Error('No query string parameters');
    }
    // const headers: APIGatewayProxyEventHeaders = event.headers;
    const headers: APIGatewayProxyEvent["headers"] = event.headers;

    const params: RenderParams = {
        path: event.queryStringParameters.path,
        paperSize: PaperSize[event.queryStringParameters.paperSize] || PaperSize.letter,
        orientation: Orientation[event.queryStringParameters.orientation] || Orientation.landscape
    };
    if(event.queryStringParameters.jwt) {
        params.jwt = event.queryStringParameters.jwt;
    } else if(headers[authHeader]) {
        if(headers[authHeader].startsWith(tokenStart)) {
            params.jwt = headers[authHeader].substring(tokenStart.length);
        }
    }
    if(headers['cookie']) {
        params.cookie = headers['cookie'];
    }
    if(event.queryStringParameters.passCookies && event.headers?.Cookie) {
        params.cookies = splitCookies(event.headers.Cookie);
    }
    if(event.queryStringParameters.timezone) {
        params.timezone = event.queryStringParameters.timezone;
    }
    return params;
}

export default parseParameters;
