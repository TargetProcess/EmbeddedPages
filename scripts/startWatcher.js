const path = require('path');
const shell = require('shelljs');

const mashupsPathVariable = 'TARGETPROCESS_MASHUPS_PATH';
const mashupsPath = shell.env[mashupsPathVariable]; // e.g. 'C:\tp3\Code\Main\Tp.Web\JavaScript\Mashups\Common'
if (!mashupsPath) {
    throw new Error(`Please define ${mashupsPathVariable} env variable`);
}

const outputPath = path.join(mashupsPath, shell.env.npm_package_name);

shell.rm('-rf', outputPath);
shell.exec(`cross-env NODE_ENV=development webpack --config webpack/development.config.js --watch --output-path ${outputPath}`);
