//@flow
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;
const shortid = require('shortid');
const Map = require('immutable').Map;

const PHANTOM_SCRIPT = '/phantomjs/raster.js';
const TMP_PATH = '/tmp/';
const FORMAT = 'pdf';

export const SITE = 'http://toyotainstituteaustralia.com.au/';

export type RenderParams = {
    jwt: string,
    cookies: Object,
    path: string,
    paperSize: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid',
    orientation: 'portrait' | 'landscape'
};

function createUrl(path: ?string): string{
    return `${SITE}${path||''}`;
}

export function renderSitePhantom(params: RenderParams): Promise<Buffer>{
    return new Promise((resolve: (result: Buffer) => void, reject: (error: Error) => void) => {
        var file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
        var childArgs = [
            path.join(__dirname, PHANTOM_SCRIPT),
            '--url', createUrl(params.path),
            '--file',file_path,
            '--size',params.paperSize || 'A4',
            '--orientation', params.orientation || 'landscape'
        ];
        
        if(params.jwt){
            childArgs.push('--jwt', params.jwt);
        }
        if(params.cookies){
            var cookieMap = Map(params.cookies);
            for (var [key, value] of cookieMap.entries()) {
                childArgs.push('--cookie', key + "=" + value);
            }
        }
        

        var phantom = childProcess.spawn(binPath, childArgs);
        phantom.stdout.on('data', (data: string) => {
            console.log(`phantom: ${data}`);
        });

        phantom.stderr.on('data', (data: string) => {
            console.error(`phantom: ${data}`);
        });

        phantom.on('close', (code: number) => {
            console.log(`child process exited with code ${code}`);
            if(code === 0){
                fs.readFile(file_path,(err: any, data: any): void => {
                    if(err){
                        console.error('Error reading export', err);
                        return reject(err);
                    }
                    fs.unlink(file_path, (err: any) => {
                        if (err) console.error(err);
                    });
                    return resolve(data);
                }); 
            } else {
                console.error('Error executing process');
                reject(Error('Error executing process'));
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
    const Nightmare = require('nightmare');
    let file_path = path.join(TMP_PATH, `${shortid.generate()}.${FORMAT}`);
    let nightmare = Nightmare({
        show: false,
        webPreferences: {
            preload: path.resolve(path.join(__dirname,"nightmare","preload.js"))
        }
    });
    return new Promise((resolve: (result: Buffer) => void, reject: (error: Error) => void) => {
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
                // $FlowFixMe
                return XMLHttpRequest.outstanding_length === 0;
            })
            .wait(100)
            .pdf(file_path, {
                pageSize: params.paperSize,
                printBackground: true,
                landscape: params.orientation === 'landscape'
            })
            .then(() => {
                fs.readFile(file_path,(err: any, data: any): void => {
                    if(err){
                        console.error('Error reading export', err);
                        return reject(err);
                    }
                    fs.unlink(file_path, (err: any) => {
                        if (err) console.error(err);
                    });
                    return resolve(data);
                });   
            });
    });
}
