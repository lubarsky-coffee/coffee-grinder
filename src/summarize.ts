import fs from 'fs'

import { log } from './log.ts'
import { news } from './store.ts'
import { restricted } from '../config/agencies.ts'
import { decodeGoogleNewsUrl } from './decode-google-news-url.ts'
import { fetchArticle } from './fetch-article.ts'
import { htmlToText } from './html-to-text.ts'
import { ai } from './ai.ts'

function sleep(ms) {
	if (ms <= 0) return
	log('resting', (ms/1e3).toFixed() + 's...')
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function summarize() {
	let list = news.filter(e => e.summary === undefined)

	let stats = { processed: 0, failed: 0 }
	let last = { urlDecode: { time: 0, delay: 15e3 }, ai: { time: 0, delay: 5e3 } }
	for (let i = 0; i < list.length; i++) {
		let event = list[i]
		log(`\n[${i + 1}/${list.length}]`, event.articles[0].title)
		event.id = i + 1

		if (event.summary === undefined) {
			for (let j = 0; j < event.articles.length; j++) {
				let a = event.articles[j]
				if (restricted.includes(a.source)) continue

				await sleep(last.urlDecode.time + last.urlDecode.delay - Date.now())
				last.urlDecode.delay += 1e3
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
				fs.writeFileSync(`articles/${i+1}.${j+1}.txt`, `${a.title}\n\n${text}`)
				if (text.length < 500) {
					log('text too short', text.length)
					continue
				}
				let skip = text.indexOf(a.title.split(' ')[0])
				if (skip > 0 && text.length - skip > 500) {
					text = text.slice(skip)
				}
				text = text.slice(0, 30000)

				await sleep(last.ai.time + last.ai.delay - Date.now())
				log('Summarizing', text.length, 'chars...')
				last.ai.time = Date.now()
				let res = await ai(a.title, text)
				if (!res) continue
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
}

if (process.argv[1].endsWith('summarize.ts')) summarize()