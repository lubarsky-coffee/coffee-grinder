import fs from 'fs'

import { log } from './log.ts'
import { load } from './load.ts'
import { decodeGoogleNewsUrl } from './decode-google-news-url.ts'
import { htmlToText } from './html-to-text.ts'
import { summarize } from './ai.ts'
import { speak } from './speech.ts'
import { fetchArticle } from './fetch-article.ts'

function sleep(ms) {
	log('resting', (ms/1e3).toFixed() + 's...')
	return new Promise(resolve => setTimeout(resolve, ms))
}

let news = await load()
let n = news.length
for (let i = 0; i < n; i++) {
	let start = Date.now().valueOf()
	let delay = 0
	let a = news[i]
	let id = i + 1
	log()
	log(`[${id}/${n}]`, a.title)

	if (!a.originalUrl) {
		log('Decoding URL...')
		a.originalUrl = await decodeGoogleNewsUrl(a.url)
		if (a.originalUrl) {
			log('got', a.originalUrl)
			delay = Math.max(delay, 10e3)
		} else {
			await sleep(5*60e3)
			i--
			continue
		}
	}
	if (a.summary === undefined) {
		log('Fetching article...')
		let html = await fetchArticle(a.originalUrl)
		if (!html) continue
		fs.writeFileSync(`articles/${id}.html`, html)
		log('got', html.length, 'bytes')

		let text = htmlToText(html)
		fs.writeFileSync(`articles/${id}.txt`, `${a.title}\n\n${text}`)
		a.originalTitle = a.title
		text = text.slice(text.indexOf(a.title.split(' ')[0]))

		log('Summarizing', text.length, 'bytes...')
		let res = await summarize(a.title, text)
		delay = Math.max(delay, res.delay)
		delete res.delay
		Object.assign(a, res)

		if (a.summary) {
			log('Speaking', a.summary.length, 'bytes...')
			await speak(id, a.summary)
		}
	}
	let end = Date.now().valueOf()
	delay -= (end - start)
	if (delay > 0) {
		await sleep(Math.max(1e3, delay))
	}
}
