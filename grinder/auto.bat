@echo off
git pull
fnm use 2>nul
call npm i --loglevel=error
call npm start auto > logs/auto.log
pause
