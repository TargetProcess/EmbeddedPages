const shell = require('shelljs');
const outputPath = 'build/library';

shell.rm('-rf', outputPath);
shell.exec(`cross-env NODE_ENV=production webpack --config webpack/library.config.js --output-path ${outputPath} --progress`);
