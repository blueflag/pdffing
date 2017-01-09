var path = require('path')
var fs = require('fs');
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var shortid = require('shortid');
var Map = require('immutable').Map;

var TMP_PATH = '/tmp/';
var FORMAT = 'pdf';
var SITE = 'http://localhost:8885/#/gapreport/technical_overview';
var PAPER_SIZE = 'Letter';

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

var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    webPreferences: {
        preload: path.resolve("nightmare-preload.js")
    }
});

function renderSiteNightmare(params){    
    // headers go here.
    var file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
    return new Promise((resolve, reject) => {
        let nightmareCurrent = nightmare
        if(params.cookies){ 
            let cookieMap = Map(params.cookies);
            console.log(cookieMap)
            for (var [key, value] of cookieMap.entries()) {
                nightmareCurrent = nightmareCurrent.cookies.set({name: key, value: value, url: SITE});
            }
        }
        
        nightmareCurrent
            .goto(SITE)
            .on('console', () => {
                console.log(arguments);
            })
            .wait(100)
            .wait(() => {
                return XMLHttpRequest.prototype.outstanding_length === 0
            })
            .wait(100)
            .pdf(file_path, {pageSize: PAPER_SIZE})
            .then((stuff, otherstuff) => {
                fs.readFile(file_path, (err, data)=> {
                    fs.unlink(file_path, (err) => {
                        if (err) console.error(err);
                    });
                    return resolve(data);
                })  
            });
    });

}

var count = 0;


function waitOnXHRRequests(){
    
}

module.exports = renderSiteNightmare;