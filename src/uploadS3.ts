import AWS from 'aws-sdk';
import shortid from 'shortid';

const AWS_S3_BUCKET: string = process.env.S3_BUCKET || 's3pdffing';
const S3_PATH: string = process.env.S3_PATH  || 'pdfs';
const CONTENT_TYPE = 'application/pdf';
const endpoint = process.env.LOCALSTACK_HOSTNAME ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` : null;


/**
 * Uploads a file to s3 and returns a signed url for accessing the data uploaded to S3.
 * 
 * @param {string} uploadKey key to be used for the upload.
 * @param {string} buffer buffer to upload
 * @param {string} filename type of content being uploaded.
 * @param {string} contentType type of content being uploaded.
 * @returns {Promise<string>} signed url for accessing content.
 */
function uploadS3File(buffer: Buffer, filename: string, contentType: string = CONTENT_TYPE): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
        const key = `${S3_PATH}/${filename || shortid.generate()}`;
        const params = {
            Bucket: AWS_S3_BUCKET,
            Key: key,
            ContentType: contentType,
            Body: buffer
        };
        const s3Params: AWS.S3.Types.ClientConfiguration = {};
        if(endpoint) {
            s3Params.endpoint = new AWS.Endpoint(endpoint);
        }
        const s3 = new AWS.S3(s3Params);
        s3.upload(params, (err: Error): void => {
            if (err != null){
                return reject(err);
            } else {
                return resolve(s3.getSignedUrl('getObject', {
                    Bucket: AWS_S3_BUCKET,
                    Key: key
                }));
            }
        });
    });
}
export default uploadS3File;
