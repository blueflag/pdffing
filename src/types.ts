

interface Dictionary<T> {
    [Key: string]: T;
}

const PaperSize = {
    a3: 'a3',
    a4: 'a4',
    a5: 'a5',
    legal: 'legal',
    letter: 'letter',
    tabloid: 'tabloid'
};

enum Orientation {
    portrait = 'portrait',
    landscape = 'landscape'
}

interface RenderParams {
    jwt?: string,
    cookie?: string,
    cookies?: Dictionary<string>,
    path: string,
    paperSize: "letter" | "legal" | "tabloid" | "ledger" | "a0" | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | undefined,
    orientation: Orientation,
    destDir?: string,
    timezone?: string
}

export {
    Dictionary,
    PaperSize,
    Orientation,
    RenderParams
};
