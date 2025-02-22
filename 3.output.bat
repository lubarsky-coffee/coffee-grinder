@echo off
cd grinder
fnm use 2>nul
call npm run slides > logs/slides.log

cd ../img
screenshotmaker_2.0.ahk

cd ../grinder
call npm run audio > logs/audio.log
pause