const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;
const shortid = require('shortid');
const Map = require('immutable').Map;

const TMP_PATH = '/tmp/';
const FORMAT = 'pdf';
const SITE = 'http://toyotainstituteaustralia.com.au/';
const PAPER_SIZE = 'Letter';
const Nightmare = require('nightmare');

var nightmare = null;

export type RenderParams = {
    jwt: string,
    cookies: string[],
    path: string
};

function createUrl(path: string): string{
    return `${SITE}${path||''}`;
}

export function renderSitePhantom(params: RenderParams): Promise<Buffer>{
    return new Promise((resolve, reject) => {
        var file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
        var childArgs = [
            path.join(__dirname, '/phantomjs/raster.js'),
            '--url', createUrl(params.path),
            '--file',file_path,
            '--size',PAPER_SIZE
        ];
        if(params){
            if(params.jwt){
                childArgs.push('--jwt', params.jwt);
            }
            if(params.cookies){
                var cookieMap = Map(params.cookies);
                for (var [key, value] of cookieMap.entries()) {
                    childArgs.push('--cookie', key + "=" + value);
                }
            }
        }

        var phantom = childProcess.spawn(binPath, childArgs);
        phantom.stdout.on('data', (data) => {
            console.log(`phantom: ${data}`);
        });

        phantom.stderr.on('data', (data) => {
            console.error(`phantom: ${data}`);
        });

        phantom.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if(code === 0){
                fs.readFile(file_path, (err, data)=> {
                    if(err){
                        console.error('Error reading export', err);
                        reject(err);
                    }
                    fs.unlink(file_path, (err) => {
                        if (err) console.error(err);
                    });
                    return resolve(data);
                }); 
            } else {
                console.error('Error executing process');
            }
        });
    });
}

/**
 * Renders the site using nightmare ( that uses electron and chrome.)
 * This method requires X11, Cooca etc. and therefor will not currently work on Lambda.
 * 
 * Should be able to use this version onece this bug is resolved.
 * https://github.com/electron/electron/issues/228
 */

export function renderSiteNightmare(params: RenderParams): Promise<Buffer>{    
    if(nightmare === null){
        nightmare = Nightmare({
            show: false,
            webPreferences: {
                preload: path.resolve(path.join(__dirname,"nightmare","preload.js"))
            }
        });
    }
    // headers go here.
    let file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
    return new Promise((resolve, reject) => {
        let nightmareCurrent = nightmare;
        if(params.cookies){ 
            let cookieMap = Map(params.cookies);
            for (var [key, value] of cookieMap.entries()) {
                nightmareCurrent = nightmareCurrent.cookies.set({name: key, value: value, url: SITE});
            }
        }
        nightmareCurrent
            .goto(createUrl(params.path))
            .on('console', () => {
                console.log(arguments);
            })
            .wait(100)
            .wait((): boolean => {
                return XMLHttpRequest.prototype.outstanding_length === 0;
            })
            .wait(100)
            .pdf(file_path, {pageSize: PAPER_SIZE})
            .then(() => {
                fs.readFile(file_path, (err, data)=> {
                    fs.unlink(file_path, (err) => {
                        if (err) console.error(err);
                    });
                    return resolve(data);
                });  
            });
    });
}
