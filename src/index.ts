import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { load } from './load.ts'
import { restricted } from '../config/agencies.ts'
import { decodeGoogleNewsUrl } from './decode-google-news-url.ts'
import { fetchArticle } from './fetch-article.ts'
import { htmlToText } from './html-to-text.ts'
import { summarize } from './ai.ts'
import { speak } from './speech.ts'
import { deletePresentation, presentationExists, createPresentation, addSlide } from './google-slides.ts'

if (process.argv[2] === 'fresh') {
	news.length = 0
	deletePresentation()
}

function sleep(ms) {
	if (ms <= 0) return
	log('resting', (ms/1e3).toFixed() + 's...')
	return new Promise(resolve => setTimeout(resolve, ms))
}

await load()

let toSummarize = news.filter(e => e.summary === undefined)

let stats = { processed: 0, failed: 0 }
let last = { urlDecode: { time: 0, delay: 15e3 }, ai: { time: 0, delay: 5e3 } }
for (let i = 0; i < toSummarize.length; i++) {
	let event = toSummarize[i]
	log(`\n[${i + 1}/${toSummarize.length}]`, event.articles[0].title)
	event.id = i + 1

	if (event.summary === undefined) {
		for (let j = 0; j < event.articles.length; j++) {
			let a = event.articles[j]
			if (restricted.includes(a.source)) continue

			await sleep(last.urlDecode.time + last.urlDecode.delay - Date.now())
			last.urlDecode.delay += 500
			log('Decoding URL...')
			last.urlDecode.time = Date.now()
			a.originalUrl = await decodeGoogleNewsUrl(a.url)
			if (!a.originalUrl) {
				await sleep(5*60e3)
				j--
				continue
			}
			log('got', a.originalUrl)

			log('Fetching', a.source, 'article...')
			let html = await fetchArticle(a.originalUrl)
			if (!html) continue
			log('got', html.length, 'chars')
			fs.writeFileSync(`articles/${i+1}.${j+1}.html`, `<!--\n${a.originalUrl}\n-->${html}`)

			let text = htmlToText(html)
			fs.writeFileSync(`articles/${i}.${j}.txt`, `${a.title}\n\n${text}`)
			text = text.slice(text.indexOf(a.title.split(' ')[0]))
			if (text.length < 500) {
				log('text too short', text.length)
				continue
			}

			await sleep(last.ai.time + last.ai.delay - Date.now())
			log('Summarizing', text.length, 'chars...')
			last.ai.time = Date.now()
			let res = await summarize(a.title, text)
			last.ai.delay = res.delay
			delete res.delay
			if (!res.summary) {
				log('failed to summarize')
				continue
			}
			Object.assign(event, res, { url: a.originalUrl, source: a.source })
			stats.processed++
			break
		}

		if (!event.summary) {
			log('failed to process')
			Object.assign(event, event.articles[0], { summary: '' })
			stats.failed++
			continue
		}
	}
}
log(stats)

let toOutput = news.filter(e => !e.sqk && e.summary != undefined)
let order = a => (a.categoryId ?? 99) * 10 + (a.priority ?? 9)
toOutput.forEach(e => e.order = order(e))
toOutput.sort((a, b) => order(a) - order(b))

if (!presentationExists()) {
	news.forEach(e => {
		e.sqk = 0
		e.categorySqk = 0
	})
	await createPresentation()
}

let sqk = 0
let categorySqk = news.reduce((categorySqk, e) => {
	sqk = Math.max(sqk, e.sqk ?? 0)
	categorySqk[e.categoryId] = Math.max(categorySqk[e.categoryId] ?? 0, e.categorySqk ?? 0)
	return categorySqk
}, [])

for (let i = 0; i < toOutput.length; i++) {
	let event = toOutput[i]
	log(`\n[${i + 1}/${toOutput.length}]`, event.title)
	event.categorySqk = ++categorySqk[event.categoryId]

	if (event.summary && !event.audio) {
		log('Speaking', event.summary.length, 'bytes...')
		await speak(sqk + 1, event.summary)
		event.audio = true
	}

	log('Adding slide...')
	await addSlide({ sqk: sqk + 1, ...event })
	event.sqk = ++sqk
}
