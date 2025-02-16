import { news } from './store.ts'
import { log } from './log.ts'
import { loadTable } from './google-sheets.ts'
import { spreadsheetId, axiomSheet } from '../config/google-drive.ts'
import { topicsMap } from '../config/topics.ts'

export async function merge() {
	let input = await loadTable(spreadsheetId, axiomSheet)
	news.forEach(e => {
		let row = input.find(r => r.sqk == e.sqk)
		if (row && row.json) {
			try {
				let res = JSON.parse(row.json.replace('```json', '').replace('```', ''))
				e.topic ||= topicsMap[res.topic]
				e.priority ||= res.priority
				e.titleRu ||= res.titleRu
				e.summary ||= res.summary
				e.aiTopic = topicsMap[res.topic]
				e.aiPriority = res.priority
				log('ok', row.sqk)
			} catch(e) {
				log(row.sqk, e)
			}
		}
	})
}

if (process.argv[1].endsWith('merge.ts')) await merge()