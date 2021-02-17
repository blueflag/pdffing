import puppeteer, {Browser, Page} from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import {RenderParams} from '../types';

console.log({chromium});

export default async function renderPdf(params: RenderParams): Promise<string> {
	const {path} = params;
	const filename: string = 'test.pdf';

	if(!path) {
		throw new Error('No render path provided');
	}

	console.log(puppeteer);

	console.log(`Render ${path}`);

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
		//await page.goto(params.path);
		await page.goto('http://elvey.lv');
		console.log('navigate');
		//await page.screenshot({path: 'test.png'});
		await page.pdf({path: 'test.pdf', printBackground: true});
		console.log('pdf');

		await browser.close();
		console.log('close');

	} catch (err: any) {
		console.error(err);
	}

	return filename;
}

