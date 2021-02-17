import {APIGatewayProxyEvent} from 'aws-lambda';
import {Dictionary, PaperSize, Orientation, RenderParams} from '../types';


function splitCookies(cookies: string): Dictionary<string>{
    const cookieValues: Array<string> = cookies.split(';');
    const cookieMap: Dictionary<string> = {};
    for (let i: number = 0; i < cookieValues.length; i++) {
        const cookieNameValuePairs: Array<string> = cookieValues[i].split('=');
        cookieMap[cookieNameValuePairs[0].trim()] = cookieNameValuePairs[1].trim();
    }
    return cookieMap;
}

function parseParameters(event: APIGatewayProxyEvent): RenderParams {
    if(!event.queryStringParameters) { 
			throw new Error('No query string parameters');
		}

			const params: RenderParams = {
				path: event.queryStringParameters.path,
				paperSize: PaperSize[event.queryStringParameters.paperSize] ?? PaperSize.Letter,
				orientation: Orientation[event.queryStringParameters.orientation] ?? Orientation.landscape
			};
			if(event.queryStringParameters.jwt) {
					params.jwt = event.queryStringParameters.jwt;
			}
			if(event.queryStringParameters.passCookies && event.headers?.Cookie) {
					params.cookies = splitCookies(event.headers.Cookie);
			}
		return params;
}

export default parseParameters;
