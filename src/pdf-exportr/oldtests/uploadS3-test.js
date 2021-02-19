import test from 'ava';
const proxyquire = require('proxyquire').noCallThru();

test('uploadS3File - on success returns signed url that amazon decides', (t: AssertContext) : void => {
    var s3Upload = proxyquire('../uploadS3', {
        'aws-sdk' : {
            S3: () => ({
                getSignedUrl: () => 'SIGNED_URL',
                upload: (params: any, cb: (err: err) => any) => {
                    cb();
                }
            })
        }
    });
    return s3Upload(new Buffer('')).then((result: string): Promise<void> => {
        t.is(result, 'SIGNED_URL');
        return Promise.resolve();
    });
});

test('uploadS3File - rejects with error on error', (t: AssertContext) : void => {
    var s3Upload = proxyquire('../uploadS3', {
        'aws-sdk' : {
            S3: () => ({
                getSignedUrl: () => 'SIGNED_URL',
                upload: (params: any, cb: (err: err) => any) => {
                    cb(new Error('Message'));
                }
            })
        }
    });
    return s3Upload(new Buffer(''))
        .catch((error: Error): Promise<void> => {
            t.is(error.message, 'Message');
            return Promise.resolve();
        });
});