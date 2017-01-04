"use strict";
var page = require('webpage').create();
var system = require('system');

var address, output, size, pageWidth, pageHeight;
var program = require('minimist')(system.args);
console.log(JSON.stringify(program))
if(!program.url || program.help || !program.file){
    console.log('--url [value]', '(Required) URL to open');
    console.log('--jwt [value]', 'JWT token to use for request'),
    console.log('--file [value]', 'file to output to'),
    console.log('--size [value]', 'paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter" image (png/jpg output) examples: "1920px" entire page, window width 1920px'),
    console.log('--zoom [value]', 'zoom page by %')
    phantom.exit(1);
}

address = program.url;
output = program.file;
page.viewportSize = { width: 600, height: 600 };
if (program.size && output.substr(-4) === ".pdf") {
    size = program.size.split('*');
    page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                        : { format: program.size, orientation: 'portrait', margin: '1cm' };
} else if (program.size && program.size[3].substr(-2) === "px") {
    size = program.size[3].split('*');
    if (size.length === 2) {
        pageWidth = parseInt(size[0], 10);
        pageHeight = parseInt(size[1], 10);
        page.viewportSize = { width: pageWidth, height: pageHeight };
        page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
    } else {
        console.log("size:", program.size);
        pageWidth = parseInt(program.size, 10);
        pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
        console.log ("pageHeight:",pageHeight);
        page.viewportSize = { width: pageWidth, height: pageHeight };
    }
}
if (program.zoom) {
    page.zoomFactor = program.zoom;
}
page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        window.setTimeout(function () {
            page.render(output);
            phantom.exit();
        }, 200);
    }
});

