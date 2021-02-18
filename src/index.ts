import fs from 'fs';
import {APIGatewayProxyEvent, Context, APIGatewayProxyResult} from 'aws-lambda';
import {RenderParams} from './types';
import parseParameters from './processes/parse_parameters';
import renderPdf from './processes/render-pdf';
import uploadS3 from './uploadS3';
const TMP_PATH = '/tmp/';


export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

		try {

			console.log(`${event.httpMethod}: ${event.resource} (${context.invokedFunctionArn})`);

			const params: RenderParams = parseParameters(event);
			params.destDir = TMP_PATH;
			console.log({params});
			if(!params.path) {
				return {
					statusCode: 400,
					headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
					},
					body: JSON.stringify({
						error: 'No path provided'
					})
			}
			}


			const filename = await renderPdf(params);
			console.log({filename});
			const buffer = fs.readFileSync(filename);
			const result = await uploadS3(buffer);
			console.log('s3 uploaded', result);
			fs.unlinkSync(filename);
				
			//console.log({event, context});
			return {
				statusCode: 200,
				headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify({
						params,
						filename
				})
			}
		} catch (err: any) {
			console.error(err);
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
