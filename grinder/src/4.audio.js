import { log } from './log.js'
import { news } from './store.js'
import { speak } from './eleven.js'

export async function audio() {
	let list = news.filter(e => e.sqk && e.summary)
	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		log(`\n[${i + 1}/${list.length}]`, `${event.sqk}. ${event.titleEn || event.titleRu}`)

		if (event.summary) {
			log('Speaking', event.summary.length, 'chars...')
			await speak(event.sqk, event.summary)
		}
	}
}

if (process.argv[1].endsWith('audio')) audio()
