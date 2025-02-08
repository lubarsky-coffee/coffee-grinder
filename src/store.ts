import { proxy, subscribe } from 'valtio/vanilla'

import { log } from './log.ts'
import { loadSheet, saveSheet } from './google-sheets.ts'
import { spreadsheetId, sheetName } from '../config/google-drive.ts'

export let news = []
// try {
// 	news = JSON.parse(fs.readFileSync('news.json', 'utf8'))
// } catch(e) {}
// news = proxy(news)
// subscribe(news, () => fs.writeFileSync('news.json', JSON.stringify(news, null, 2)))
news = await loadSheet(spreadsheetId, sheetName)
news = proxy(news)
subscribe(news, save)

export async function save() {
	try {
		// log('Saving...')
		await saveSheet(spreadsheetId, sheetName, news)
		// log('saved')
	} catch(e) {
		log('Failed to save', e)
	}
}