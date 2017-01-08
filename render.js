var path = require('path')
var fs = require('fs');
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var shortid = require('shortid');
var Map = require('immutable').Map;

const TMP_PATH = '/tmp/';
const FORMAT = 'pdf';
const SITE = 'http://localhost:8885/';
const PAPER_SIZE = 'Letter';

function renderSite(params){
    return new Promise((resolve, reject) => {
        console.log('PARAMS:',  params)
        var file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
        var childArgs = [
            path.join(__dirname, '/phantomjs/raster.js'),
            '--url', `${SITE}`,
            '--file',file_path,
            '--size',PAPER_SIZE
        ]
        if(params){
            if(params.jwt){
                childArgs.push('--jwt', params.jwt)
            }
            if(params.cookies){
                var cookieMap = Map(params.cookies);
                for (var [key, value] of cookieMap.entries()) {
                    childArgs.push('--cookie', key + "=" + value)
                }
            }
        }

        console.log(childArgs)
        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            console.log(stdout);
            console.error(stderr);
            fs.readFile(file_path, (err, data)=> {
                fs.unlink(file_path, (err) => {
                    if (err) console.error(err);
                });
                return resolve(data);
            })  
        })
    });
}

module.exports = renderSite;