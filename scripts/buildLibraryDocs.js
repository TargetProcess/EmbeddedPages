/* globals ls, cd, cat, pwd, rm, mkdir, mv, cp */

require('shelljs/global');

const path = require('path');
const url = require('url');
const fs = require('fs');

const mashupManifestName = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/manifest.json'))).Name;
const mashupPublishName = mashupManifestName || JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'))).name;

const processReadmeText = (text, publishName) => {

    const reg = /(!\[[^\]]*\])\(([^\)]+)(?!https?:\/\/)\)/g;

    return text.replace(reg, (main, img, imgPath) => {

        return `${img}(${url.resolve(`https://github.com/TargetProcess/TP3MashupLibrary/raw/master/${publishName}/`, imgPath)})`;

    });

};

const processReadme = (publishName) => {

    const targetFilePath = 'docs/README.md';
    const file = ls(targetFilePath)[0];

    if (!file) throw new Error(`File "${targetFilePath}" is not found`);

    cp('-fR', 'docs/*', 'build/library/');
    processReadmeText(cat(file), publishName).to('build/library/README.mkd');
    rm('-rf', 'build/library/README.md');

};

processReadme(mashupPublishName);
