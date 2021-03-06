import puppeteer, {Browser, Page} from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import {RenderParams, Orientation} from '../types';
import shortid from 'shortid';
import path from 'path';
import extractOrigin from './extract-origin';
import logger from '../logger';

const format = 'pdf';

export default async function renderPdf(params: RenderParams): Promise<string> {
    const {path: uri} = params;
    const jwt: string|undefined = params.jwt;
    const destDir = params.destDir || './';
    const filename: string = path.join(destDir, `${shortid.generate()}.${format}`);

    if(!path) {
        throw new Error('No render path provided');
    }

    logger.info(`Generate PDF from ${uri}`);

    try {
        const executablePath = await chromium.executablePath;
        const browser: Browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        });
        const page: Page = await browser.newPage();
        if(jwt) {
            await page.setExtraHTTPHeaders({'Authorization': `Bearer ${jwt}`});
            logger.info('Use bearer token auth');
        }
        if(params.cookie) {
            await page.setExtraHTTPHeaders({'cookie': params.cookie});
            logger.info('Use cookie auth');
        }

        if(params.timezone) {
            await page.emulateTimezone(params.timezone);
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
                    authorization: undefined // remove auth header
                });
                request.continue({headers});
            } else {
                request.continue();
            }
        });

        await page.goto(uri);
        await page.waitForSelector('#PDF_LOADING', {hidden: true});

        await page.$$eval('img[src]', imgs => Promise.all(imgs.map(img => {
            if(img.complete) {
                return;
            }
            return new Promise((resolve, reject) => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', reject);
            });
        })));
        await page.pdf({
            path: filename,
            printBackground: true,
            format: params.paperSize,
            landscape: params.orientation == Orientation.landscape,
            margin: {top: 0, left: 0, right: 0, bottom: 0},
            preferCSSPageSize: false,
            displayHeaderFooter: false
        });

        await browser.close();

    } catch (err: unknown) {
        logger.error(err);
    }

    return filename;
}

