@echo off
git pull

cd grinder
fnm use 2>nul
call npm i --loglevel=error
::call npm run cleanup auto > logs/cleanup.log
call npm run load auto > logs/load.log
call npm run summarize auto > logs/summarize.log
::call npm run slides auto > logs/slides.log

cd ../img
::screenshotmaker_2.0.ahk

cd ../grinder
::call npm run audio auto > logs/audio.log

pause
