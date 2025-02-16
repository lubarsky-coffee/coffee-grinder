import { proxy, subscribe } from 'valtio/vanilla'

import { log } from './log.js'
import { loadTable, saveTable } from './google-sheets.js'
import { spreadsheetId, newsSheet } from '../config/google-drive.js'

export let news = []
// try {
// 	news = JSON.parse(fs.readFileSync('news.json', 'utf8'))
// } catch(e) {}
// news = proxy(news)
// subscribe(news, () => fs.writeFileSync('news.json', JSON.stringify(news, null, 2)))
news = proxy(await loadTable(spreadsheetId, newsSheet))
subscribe(news, save)

export async function save() {
	try {
		// log('Saving...')
		await saveTable(spreadsheetId, newsSheet, news)
		// log('saved')
	} catch(e) {
		log('Failed to save', e)
	}
}