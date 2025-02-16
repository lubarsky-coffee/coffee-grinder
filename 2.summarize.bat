@echo off
cd grinder
fnm use
call npm run summarize > logs/summarize.log
pause