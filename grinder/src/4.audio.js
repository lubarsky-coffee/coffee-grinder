import { log } from './log.js'
import { news } from './store.js'
import { speak } from './eleven.js'
import { topics } from '../config/topics.js'

export async function audio() {
	// news.forEach((e, i) => e.id = e.id ?? i + 1)
	log()
	let list = news.filter(e => e.summary && topics[e.topic])

	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		log(`\n(${i + 1}/${list.length})`, `${event.sqk}. ${event.titleEn || event.titleRu}`)

		if (event.summary) {
			log('Speaking', event.summary.length, 'chars...')
			await speak(event.sqk, event.summary)
		}
	}
}

if (process.argv[1].endsWith('audio')) audio()
