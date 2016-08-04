const shell = require('shelljs');
const outputPath = 'build/development';
shell.rm('-rf', outputPath);
shell.exec(`cross-env NODE_ENV=development webpack --config webpack/development.config.js --output-path ${outputPath} --progress`);
