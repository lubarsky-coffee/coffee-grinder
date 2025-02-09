import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { speak } from './speech.ts'
import { presentationExists, createPresentation, addSlide } from './google-slides.ts'

let topics = {
	'01. Big picture': { id: 1, max: 6 },
	'02. Trump':  { id: 2, max: 24 },
	'03. US':  { id: 3, max: 6 },
	'04. Left reaction':  { id: 4, max: 6 },
	'05. Ukraine':  { id: 5, max: 24 },
	'06. Coffee grounds':  { id: 6, max: 6 },
	'07. World':  { id: 7, max: 24 },
	'08. Marasmus':  { id: 8, max: 6 },
	'09. Blitz':  { id: 9, max: 6 },
	'10. Tech':  { id: 10, max: 6 },
	'11. Crazy':  { id: 11, max: 6 },
}

export async function output() {
	log()
	if (!await presentationExists()) {
		news.forEach(e => {
			delete e.sqk
			delete e.topicSqk
		})
		await createPresentation()
	}

	let list = news.filter(e => !e.sqk && e.titleRu && topics[e.topic])
	let order = e => (topics[e.topic]?.id ?? 99) * 10 + (e.priority ?? 99)
	list.forEach(e => e.order = order(e))
	list.sort((a, b) => order(a) - order(b))

	let sqk = 3
	let topicSqk = news.reduce((topicSqk, e) => {
		sqk = Math.max(sqk, e.sqk ?? 0)
		topicSqk[e.topic] = Math.max(topicSqk[e.topic] ?? 0, e.topicSqk ?? 0)
		return topicSqk
	}, {})

	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		event.topicSqk = ++topicSqk[event.topic]
		log(`\n${i + 1}/${list.length} #${event.id} (${event.topic} ${event.topicSqk})`, `${sqk}. ${event.titleRu}`)

		// if (event.summary && !event.sqk) {
		// 	log('Speaking', event.summary.length, 'bytes...')
		// 	await speak(sqk, event.summary)
		// }

		log('Adding slide...')
		let notes = event.topicSqk > (topics[event.topic]?.max ?? 0) ? 'NOT INDEXED' : ''
		await addSlide({
			sqk,
			topicId: topics[event.topic]?.id,
			notes,
			...event,
		 })
		event.sqk = sqk++
	}

	let screenshots = list.map(e => `${e.sqk}\n${e.directUrl || e.url}\n`).join('')
	fs.writeFileSync('screenshots.txt', screenshots)
}

if (process.argv[1].endsWith('output.ts')) output()
