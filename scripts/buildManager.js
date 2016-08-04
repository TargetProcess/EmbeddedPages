const shell = require('shelljs');
const outputPath = 'build/manager';
shell.rm('-rf', outputPath);
shell.exec(`cross-env NODE_ENV=production webpack --config webpack/manager.config.js --output-path ${outputPath} --progress`);
shell.cd(outputPath);
shell.cat('mashup.config.js', 'index.js').to('index.tmp');
shell.rm('mashup.config.js', 'index.js');
shell.mv('index.tmp', 'index.js');
