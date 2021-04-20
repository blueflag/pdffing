import puppeteer, {Browser, Page} from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import {RenderParams, Orientation} from '../types';
import shortid from 'shortid';
import path from 'path';
import extractOrigin from './extract-origin';

const format = 'pdf';

export default async function renderPdf(params: RenderParams): Promise<string> {
    const {path: uri} = params;
    const jwt: string|undefined = params.jwt;
    const destDir = params.destDir || './';
    const filename: string = path.join(destDir, `${shortid.generate()}.${format}`);

    if(!path) {
        throw new Error('No render path provided');
    }

    console.log(puppeteer);

    console.log(`Render ${uri}`);

    try {
        const executablePath = await chromium.executablePath;
        console.log('path', {executablePath});
        console.log('launching...');
        const browser: Browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true
        });
        console.log('browser', browser);
        const page: Page = await browser.newPage();
        if(jwt) {
          await page.setExtraHTTPHeaders({'Authorization': `Bearer ${jwt}`});
          console.log(`Set bearer token`);
        }
        if(params.cookie) {
          await page.setExtraHTTPHeaders({'cookie': params.cookie});
          console.log('Set cookie');
        }


        // If the request is an image from another origin or any resouce from s3 exclude the auth header
        await page.setRequestInterception(true);
        const baseOrigin = extractOrigin(uri);
        page.on('request', (request) => {
          const reqOrigin = extractOrigin(request.url());
          if(
            (request.resourceType() == 'image' && baseOrigin !== reqOrigin)
            || reqOrigin.indexOf('amazonaws.com') > 0
          ) {
            // Override headers
            const headers = Object.assign({}, request.headers(), {
              authorization: undefined, // remove auth header
            });
            request.continue({ headers });
          } else {
            request.continue();
          }
        });

        console.log('page');
        await page.goto(uri);
        console.log('navigate');
    await page.waitForSelector('#PDF_LOADING', {hidden: true});

    await page.$$eval('img[src]', imgs => Promise.all(imgs.map(img => {
      if(img.complete) {
        return;
      }
      return new Promise((resolve, reject) => {
        img.addEventListener(resolve);
        img.addEventListener(reject);
      });
    })));
    console.log('images loaded');
        //await page.screenshot({path: 'test.png'});
        await page.pdf({
            path: filename,
            printBackground: true,
            format: params.paperSize,
            landscape: params.orientation == Orientation.landscape

        });
        console.log('pdf');

        await browser.close();
        console.log('close');

    } catch (err: any) {
        console.error(err);
    }

    return filename;
}

