import fs from 'fs'

import { log } from './log.js'
import { news } from './store.js'
import { speak } from './eleven.js'
import { topics } from '../config/topics.js'
import { presentationExists, createPresentation, addSlide } from './google-slides.js'

export async function slides() {
	// news.forEach((e, i) => e.id = e.id ?? i + 1)
	log()
	if (!await presentationExists()) {
		// news.forEach(e => {
		// 	delete e.sqk
		// 	delete e.topicSqk
		// })
		await createPresentation()
	}

	let order = e => (+e.sqk || 999) * 1000 + (topics[e.topic]?.id ?? 99) * 10 + (+e.priority || 10)
	news.sort((a, b) => order(a) - order(b))
	news.forEach((e, i) => e.sqk ||= topics[e.topic] ? i + 3 : '')

	// let list = news.filter(e => !e.sqk && e.titleRu && topics[e.topic])
	let list = news.filter(e => topics[e.topic])

	// let sqk = 3
	let topicSqk = news.reduce((topicSqk, e) => {
		// sqk = Math.max(sqk, e.sqk ?? 0)
		topicSqk[e.topic] = Math.max(topicSqk[e.topic] ?? 0, e.topicSqk ?? 0)
		return topicSqk
	}, {})

	let screenshots = list.map(e => `${e.sqk}\n${e.url}\n`).join('')
	fs.writeFileSync('../img/screenshots.txt', screenshots)
	log('Screenshots list prepared')

	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		event.topicSqk = ++topicSqk[event.topic]
		log(`\n(${i + 1}/${list.length})`, `${event.sqk}. ${event.titleEn || event.titleRu}`)

		// if (event.summary) {
		// 	log('Speaking', event.summary.length, 'bytes...')
		// 	await speak(event.sqk, event.summary)
		// }

		log('Adding slide...')
		let notes = event.topicSqk > (topics[event.topic]?.max ?? 0) ? 'NOT INDEXED' : ''
		await addSlide({
			sqk: event.sqk,
			topicId: topics[event.topic]?.id,
			notes,
			...event,
		 })
		// event.sqk = sqk++
	}
}

if (process.argv[1].endsWith('slides')) slides()
