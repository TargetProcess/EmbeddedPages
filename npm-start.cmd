@echo off
set TARGETPROCESS_MASHUPS_PATH=C:\tp3\Code\Main\Tp.Web\JavaScript\Mashups\Common
set outputPath=%TARGETPROCESS_MASHUPS_PATH%\EmbeddedPages
rd /s/q %outputPath%
set NODE_ENV=development
node_modules\.bin\webpack --config webpack/development.config.js --watch --output-path %outputPath%
