import {APIGatewayProxyEvent, Context, APIGatewayProxyResult} from 'aws-lambda';
import {Dictionary, PaperSize, Orientation, RenderParams} from './types';
import renderPdf from './processes/render-pdf';

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

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

		try {
			const params: RenderParams = parseParameters(event);
			renderPdf(params);
				
			console.log({event, context});
			return {
				statusCode: 200,
				headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify({
						params,
						input: event
				})
			}
		} catch (err: any) {
				return {
					statusCode: 400,
					headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
					},
					body: JSON.stringify({
						error: err.message
					})
			}
		}
};
