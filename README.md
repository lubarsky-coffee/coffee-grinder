Prepare the environment (Windows):

1. install node.js from https://nodejs.org/en/download/current
- press "Windows Installer (.msi)"

2. run `update.bat`

3. ask for `service-account.json` and `.env` files and copy them to the root directory


Usage:
1. run `fresh.bat` in the evening and `incremental.bat` in the morning
OR
2. run the following in order or as required:
 - `0.clean.bat` - to delete the previous presentation and clear the spreadsheet
 - `1.load.bat` - to load news from feeds to the spreadsheet
 - `2.summarize.bat` - to summarize the news and save to the spreadsheet
 - `3.output.bat` - to output the news to the presentation and generate audio
