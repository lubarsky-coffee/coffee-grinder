import { news } from './store.js'
import { archivePresentation } from './google-slides.js'
import { sleep } from './sleep.js'
import { copyFile } from './google-drive.js'
import { spreadsheetId, archiveFolderId } from '../config/google-drive.js'
import { log } from './log.js'

export async function cleanup() {
	let name = new Date(Date.now() - 24*60*60e3).toISOString().split('T')[0]
	log('Archiving spreadsheet...')
	await copyFile(spreadsheetId, archiveFolderId, name)
	news.forEach((e, i) => news[i] = {})
	await sleep(1)
	news.length = 0
	archivePresentation(name)
}

if (process.argv[1].endsWith('cleanup')) cleanup()