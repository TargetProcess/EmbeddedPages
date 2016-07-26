@echo off
set outputPath=build\library
rd /s/q %outputPath%
set NODE_ENV=production
call node_modules\.bin\webpack --config webpack\library.config.js --output-path %outputPath% --progress

call node_modules\.bin\shjs scripts\buildLibraryDocs.js

set outputPath=build\manager
rd /s/q %outputPath%
call node_modules\.bin\webpack --config webpack\manager.config.js --output-path %outputPath% --progress
cd %outputPath%
copy /b mashup.config.js + index.js _tmp.js
del mashup.config.js index.js
rename _tmp.js index.js
