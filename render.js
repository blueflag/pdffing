var path = require('path')
var fs = require('fs');
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var shortid = require('shortid');
 
const TMP_PATH = '/tmp/';
const FORMAT = 'pdf';
const SITE = 'http://training.toyotainstituteaustralia.com.au/';
const PAPER_SIZE = 'A4';

renderSite();


function renderSite(params){
    return new Promise((resolve, reject) => {
        console.log(params)
        var file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
        var childArgs = [
            path.join(__dirname, '/phantomjs/raster.js'),
            `--url ${SITE}`,
            `--file ${file_path}`,
            `--size ${PAPER_SIZE}`
        ]

        if(params && params.jwt){
            childArgs.push(`--jwt ${params.jwt}`)
        }

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            fs.readFile(file_path, (err, data)=> {
                resolve(data);
                fs.unlink(file_path, (err) => {
                    if (err) throw err;
                });
            })
        })
});
}

module.exports = renderSite;