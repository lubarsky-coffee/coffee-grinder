@echo off
cd grinder
git pull
call npm i
del ..\audio\*.mp3 >nul 2>&1
del articles\*.txt >nul 2>&1
del articles\*.html >nul 2>&1
call npm run cleanup > logs/cleanup.log
pause