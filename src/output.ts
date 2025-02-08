import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { speak } from './speech.ts'
import { presentationExists, createPresentation, addSlide } from './google-slides.ts'

let topics = {
	'Big picture': { id: 1, max: 6 },
	'Trump':  { id: 2, max: 24 },
	'Coffee grounds':  { id: 3, max: 6 },
	'Left reaction':  { id: 4, max: 6 },
	'Ukraine':  { id: 5, max: 24 },
	'Marasmus':  { id: 6, max: 6 },
	'World':  { id: 7, max: 24 },
	'WTF':  { id: 8, max: 6 },
	'Blitz':  { id: 9, max: 6 },
	'Tech':  { id: 10, max: 6 },
	'Crazy':  { id: 11, max: 6 },
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

	let list = news.filter(e => !e.sqk && e.titleRu)
	let order = e => (topics[e.topic]?.id ?? 99) * 10 + (e.priority ?? 99)
	list.forEach(e => e.order = order(e))
	list.sort((a, b) => order(a) - order(b))

	let sqk = 0
	let topicSqk = news.reduce((topicSqk, e) => {
		sqk = Math.max(sqk, e.sqk ?? 0)
		topicSqk[e.topic] = Math.max(topicSqk[e.topic] ?? 0, e.topicSqk ?? 0)
		return topicSqk
	}, {})

	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		log(`\n [${i + 1}/${list.length}] (#${event.id} ${event.topic} ${event.priority}`, `${sqk + 1}. ${event.titleRu}`)

		// if (event.summary && !event.sqk) {
		// 	log('Speaking', event.summary.length, 'bytes...')
		// 	await speak(sqk + 1, event.summary)
		// }

		log('Adding slide...')
		event.topicSqk = ++topicSqk[event.topic]
		let notes = event.topicSqk > (topics[event.topic]?.max ?? 0) ? 'NOT INDEXED' : ''
		await addSlide({
			sqk: sqk + 1,
			topicId: topics[event.topic]?.id,
			notes,
			...event,
		 })
		event.sqk = ++sqk
	}

	let screenshots = news.map(e => `${e.sqk}\n${e.directUrl || e.url}\n`).join('')
	fs.writeFileSync('screenshots.txt', screenshots)
}

if (process.argv[1].endsWith('output.ts')) output()
