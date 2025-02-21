@echo off
cls
cd grinder
fnm use 2>nul
call npm run load > logs/load.log
pause