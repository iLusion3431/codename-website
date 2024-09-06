var jsdom = require("jsdom");
var path = require("path");
var hljs = require('highlight.js');
const fs = require("fs");
const pngToJpeg = require('png-to-jpeg');
var path = require("path");

function fixHtmlRefs(html, pageDir, _pageDir) {
    var dom = new jsdom.JSDOM(html);
    var links = dom.window.document.querySelectorAll("[href]");
    var imageSrcs = dom.window.document.querySelectorAll("[src]");

    for(const link of links) {
        link.href = link.href.replace(/\.md$/, ".html").replace("./" + pageDir, "./");
        if(link.href.startsWith("/")) {
            link.href = path.normalize("/" + pageDir + link.href.substring(1));
        }
        if(link.href.startsWith("root/")) {
            link.href = path.normalize("/" + _pageDir + link.href.substring(5));
        }
    }

    for(const image of imageSrcs) {
        image.src = image.src.replace(/\.md$/, ".html").replace("./" + pageDir, "./");
        if(image.src.startsWith("/")) {
            image.src = path.normalize("/" + _pageDir + image.src.substring(1));
        }
        if(image.src.startsWith("root/")) {
            image.src = path.normalize("/" + _pageDir + image.src.substring(5));
        }
    }

    var codeblocks = dom.window.document.querySelectorAll('pre code[class^="language-"]');
    for(const codeblock of codeblocks) {
        codeblock.innerHTML = hljs.highlight(codeblock.textContent, {language: codeblock.className.split("-")[1]}).value;
        codeblock.parentElement.classList.add("hljs");
    }

    // select all non hljs codeblocks
    var inlineCodeblocks = dom.window.document.querySelectorAll('code:not([class^="language-"])');
    for(const codeblock of inlineCodeblocks) {
        codeblock.classList.add("inline-code");
    }

    var inlineCodeblocks = dom.window.document.querySelectorAll('pre code:not([class^="language-"])');
    for(const codeblock of inlineCodeblocks) {
        codeblock.parentElement.classList.add("inline-code");
    }

    return dom
}

function copyImage(inpath, outpath, quality=80, convertToJpeg=true) {
    if(!convertToJpeg || path.parse(inpath).ext != ".png") {
        fs.copyFile(inpath, outpath, () => {});
        return outpath;
    }

    outpath = outpath.replace(/\.png$/, ".jpg");

    // is png

    fs.readFile(inpath, (readErr, buffer) => {
        if (readErr) {
            console.error('Error reading file:', readErr);
            return;
        }

        pngToJpeg({ quality })(buffer)
            .then(output => {
                fs.writeFile(outpath, output, (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing file:', writeErr);
                        return;
                    }
                    //console.log('Image copied successfully');
                });
            })
            .catch(err => console.error('Error converting image:', err));
    });
    return outpath;
}

module.exports = {
    fixHtmlRefs: fixHtmlRefs,
    copyImage: copyImage
}