import fs from 'fs'

import { log } from './log.ts'
import { sleep } from './sleep.ts'
import { news } from './store.ts'
import { restricted } from '../config/agencies.ts'
import { decodeGoogleNewsUrl } from './google-news.ts'
import { fetchArticle } from './fetch-article.ts'
import { htmlToText } from './html-to-text.ts'
import { ai } from './ai.ts'

let topics = {
	'Trump': '02. Trump',
	'US': '03. US',
	'Left reaction': '04. Left reaction',
	'Ukraine': '05. Ukraine',
	'Coffee grounds': '06. Coffee grounds',
	'World': '07. World',
	'Marasmus': '08. Marasmus',
	'Tech':	'10. Tech',
	'Crazy': '11. Crazy',
	'other': 'other',
}

export async function summarize() {
	let list = news.filter(e => !e.titleRu)

	let stats = { ok: 0, fail: 0 }
	let last = {
		urlDecode: { time: 0, delay: 25e3, increment: 1100 },
		ai: { time: 0, delay: 0 },
	}
	for (let i = 0; i < list.length; i++) {
		let e = list[i]
		log(`\n${i + 1}/${list.length} #${e.id}`, e.titleEn)

		if (!e.directUrl && !restricted.includes(e.source)) {
			await sleep(last.urlDecode.time + last.urlDecode.delay - Date.now())
			last.urlDecode.delay += last.urlDecode.increment
			last.urlDecode.time = Date.now()
			log('Decoding URL...')
			e.directUrl = await decodeGoogleNewsUrl(e.url)
			if (!e.directUrl) {
				await sleep(5*60e3)
				i--
				continue
			}
			log('got', e.directUrl)
		}

		let text = ''
		if (e.directUrl) {
			log('Fetching', e.source, 'article...')
			let html = await fetchArticle(e.directUrl)
			if (html) {
				log('got', html.length, 'chars')
				fs.writeFileSync(`articles/${e.id}.html`, `<!--\n${e.directUrl}\n-->${html}`)
				text = htmlToText(html)
				fs.writeFileSync(`articles/${e.id}.txt`, `${e.titleEn}\n\n${text}`)
				let skip = text.indexOf(e.titleEn.split(' ')[0])
				if (skip > 0 && text.length - skip > 1000) {
					text = text.slice(skip)
				}
				text = text.slice(0, 30000)
			}
		}

		await sleep(last.ai.time + last.ai.delay - Date.now())
		last.ai.time = Date.now()
		log('Summarizing', text.length, 'chars...')
		let res = await ai(e.titleEn, e.source, text)
		if (res) {
			last.ai.delay = res.delay
			delete res.delay
			res.topic = topics[res.topic]
			Object.assign(e, res)
		}
		if (!text || !e.summary) {
			log('failed to summarize')
			e.summary = ''
			stats.fail++
		} else {
			stats.ok++
		}
	}
	log('\n', stats)
}

if (process.argv[1].endsWith('summarize.ts')) summarize()