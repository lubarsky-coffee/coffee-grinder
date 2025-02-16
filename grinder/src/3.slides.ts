import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { speak } from './eleven.ts'
import { topics } from '../config/topics.ts'
import { presentationExists, createPresentation, addSlide } from './google-slides.ts'

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

	// let list = news.filter(e => !e.sqk && e.titleRu && topics[e.topic])
	let list = news.filter(e => topics[e.topic])

	// let sqk = 3
	let topicSqk = news.reduce((topicSqk, e) => {
		// sqk = Math.max(sqk, e.sqk ?? 0)
		topicSqk[e.topic] = Math.max(topicSqk[e.topic] ?? 0, e.topicSqk ?? 0)
		return topicSqk
	}, {})

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

	let screenshots = list.map(e => `${e.sqk}\n${e.url}\n`).join('')
	fs.writeFileSync('../screenshots.txt', screenshots)
}

if (process.argv[1].endsWith('slides.ts')) slides()
