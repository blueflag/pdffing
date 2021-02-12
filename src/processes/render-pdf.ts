import puppeteer, {Browser, Page} from 'puppeteer';
import {RenderParams} from '../types';

export default async function renderPdf(params: RenderParams): Promise<string> {
	const filename: string = 'test.pdf';
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  await page.goto(params.path);
  //await page.screenshot({path: 'test.png'});
	await page.pdf({path: 'test.pdf', printBackground: true});

  await browser.close();

	return filename;
}

