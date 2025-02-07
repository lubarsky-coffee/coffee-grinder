import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { speak } from './speech.ts'
import { presentationExists, createPresentation, addSlide } from './google-slides.ts'

export async function output() {
	log()
	if (!await presentationExists()) {
		news.forEach(e => {
			delete e.sqk
			delete e.categorySqk
		})
		await createPresentation()
	}

	let list = news.filter(e => !e.sqk && e.summary != undefined)
	// let order = a => (a.categoryId ?? 99) * 10 + (a.priority ?? 9)
	// list.sort((a, b) => order(a) - order(b))

	let sqk = 0
	let categorySqk = news.reduce((categorySqk, e) => {
		sqk = Math.max(sqk, e.sqk ?? 0)
		categorySqk[e.categoryId] = Math.max(categorySqk[e.categoryId] ?? 0, e.categorySqk ?? 0)
		return categorySqk
	}, [])

	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		log(`\n[${i + 1}/${list.length}]`, event.title)

		// if (event.summary && !event.sqk) {
		// 	log('Speaking', event.summary.length, 'bytes...')
		// 	await speak(sqk + 1, event.summary)
		// }

		log('Adding slide...')
		event.categorySqk = ++categorySqk[event.categoryId]
		await addSlide({ sqk: sqk + 1, ...event })
		event.sqk = ++sqk
	}

	let screenshots = news.map(e => `${e.sqk}\n${e.url}\n`).join('')
	fs.writeFileSync('screenshots.txt', screenshots)
}

if (process.argv[1].endsWith('output.ts')) output()
