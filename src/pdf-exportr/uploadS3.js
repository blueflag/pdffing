
var AWS_S3_BUCKET = process.env.S3_BUCKET || 'auditr-pdf-export-dev-files';
var AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT || 's3-ap-southeast-2.amazonaws.com';
var S3_PATH = process.env.S3_PATH  || 'pauls_test_files';
var AWS = require ('aws-sdk');
AWS.config.update({
    region: "ap-southeast-2"
});
var shortid = require('shortid');

/**
 * Uploads a file to s3 and returns a signed url for accessing the data uploaded to S3.
 * 
 * @param {string} uploadKey key to be used for the upload.
 * @param {string} buffer buffer to upload
 * @param {string} contentType type of content being uploaded.
 * @returns {Promise<string>} signed url for accessing content.
 */
function uploadS3File(buffer, contentType){
    return new Promise((resolve, reject) => {
        var key = `${S3_PATH}/${shortid.generate()}`;
        var params = {
            Bucket: AWS_S3_BUCKET,
            Key: key,
            ContentType: contentType || 'application/pdf'
        };
        console.log(params);
        var s3 = new AWS.S3({params: params, endpoint: AWS_S3_ENDPOINT});
        s3.upload({Body: buffer}, (err, data) => {
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