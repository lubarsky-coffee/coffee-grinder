import { news } from './store.ts'
import { archivePresentation } from './google-slides.ts'
import { sleep } from './sleep.ts'
import { copyFile } from './google-drive.ts'
import { spreadsheetId, archiveFolderId } from '../config/google-drive.ts'
import { log } from './log.ts'

export async function cleanup() {
	let name = new Date(Date.now() - 24*60*60e3).toISOString().split('T')[0]
	log('Archiving spreadsheet...')
	await copyFile(spreadsheetId, archiveFolderId, name)
	news.forEach((e, i) => news[i] = {})
	await sleep(1)
	news.length = 0
	archivePresentation(name)
}

if (process.argv[1].endsWith('cleanup.ts')) cleanup()