import puppeteer, {Browser, Page} from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import {RenderParams, Orientation} from '../types';
import shortid from 'shortid';
import path from 'path';

const format = 'pdf';

export default async function renderPdf(params: RenderParams): Promise<string> {
	const {path: uri} = params;
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
		console.log('page');
		await page.goto(uri);
		console.log('navigate');
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

