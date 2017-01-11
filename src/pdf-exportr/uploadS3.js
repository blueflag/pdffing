
//@flow

const AWS_S3_BUCKET = process.env.S3_BUCKET || 'auditr-pdf-export-dev-files';
const S3_PATH = process.env.S3_PATH  || 'pauls_test_files';
const CONTENT_TYPE = 'application/pdf';
const AWS = require ('aws-sdk');
const shortid = require('shortid');


/**
 * Uploads a file to s3 and returns a signed url for accessing the data uploaded to S3.
 * 
 * @param {string} uploadKey key to be used for the upload.
 * @param {string} buffer buffer to upload
 * @param {string} contentType type of content being uploaded.
 * @returns {Promise<string>} signed url for accessing content.
 */
function uploadS3File(buffer: Buffer): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
        var key = `${S3_PATH}/${shortid.generate()}`;
        var params = {
            Bucket: AWS_S3_BUCKET,
            Key: key,
            ContentType: CONTENT_TYPE
        };
        var s3 = new AWS.S3({params: params});
        s3.upload({Body: buffer}, (err: Error): void => {
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

module.exports = uploadS3File;