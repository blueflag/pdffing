import {PaperSize, Orientation, RenderParams} from './types';
import renderPdf from './processes/render-pdf';

const params: RenderParams = {
	path: 'http://elvey.lv',
	paperSize: PaperSize.letter,
	orientation: Orientation.landscape
}

renderPdf(params)
	.then((filename: string) =>  {
		console.log(filename);
	})
	.catch((err: any) => {
		console.error(err);
	});
