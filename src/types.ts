

interface Dictionary<T> {
    [Key: string]: T;
};

enum PaperSize {
    A3 = 'A3',
		A4 = 'A4',
		A5 = 'A5',
		Legal = 'Legal',
		Letter = 'Letter',
		Tabloid = 'Tabloid'
};

enum Orientation {
		portrait = 'portrait',
		landscape = 'landscape'
};

interface RenderParams {
    jwt?: string,
    cookies?: Dictionary<string>,
    path: string,
    paperSize: PaperSize,
    orientation: Orientation,
		destDir?: string
};

export {
	Dictionary,
	PaperSize,
	Orientation,
	RenderParams
};
