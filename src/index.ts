import fs from 'fs';
import {APIGatewayProxyEvent, Context, APIGatewayProxyResult} from 'aws-lambda';
import {RenderParams} from './types';
import parseParameters from './processes/parse_parameters';
import renderPdf from './processes/render-pdf';
import validateUrl from './processes/validate_url';
import uploadS3 from './uploadS3';
import logger from './logger';

const TMP_PATH = '/tmp/';

function getErrorResponse(message: string, code = 400): APIGatewayProxyResult {
    return {
        statusCode: code,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: message
        })
    };
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try {

        logger.info(`${event.httpMethod}: ${event.resource} (${context.invokedFunctionArn})`);

        const params: RenderParams = parseParameters(event);
        params.destDir = TMP_PATH;
        if(!params.path) {
            return getErrorResponse('no path provided');
        }

        if(!validateUrl(params.path)) {
            return getErrorResponse(`URL is not permitted: ${params.path}`);
        }

        const filename = await renderPdf(params);
        const buffer = fs.readFileSync(filename);
        const fileUrl = await uploadS3(buffer, filename);
        fs.unlinkSync(filename);
            
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                url: fileUrl
            })
        };
    } catch (err: unknown) {
        if(err instanceof Error) {
            logger.error(err);
            return getErrorResponse(err.message);
        }
        if(typeof err === 'string') {
            logger.error(err);
            return getErrorResponse(err);
        } 
        logger.error(err);
        return getErrorResponse('An unknown error occured');
    }
};
