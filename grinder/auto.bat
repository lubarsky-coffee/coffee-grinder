@echo off
fnm use 2>nul
call npm start auto > logs/auto.log
pause
