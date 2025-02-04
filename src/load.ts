import { xml2json } from 'xml-js'

import { log } from './log.ts'
import feeds from '../config/feeds.ts'
import { news } from './store.ts'

async function get(url: string) {
	return await (await fetch(url)).text()
}

function parse(xml) {
	let feed = JSON.parse(xml2json(xml, { compact: true }))
	let items = feed?.rss?.channel?.item?.map(({ title, link, source }) => ({
		title: title?._text,
		source: source?._text,
		url: link?._text,
	}))
	return items
}

function mergeInto(target, source) {
	let seen = new Set([
		...target.map(a => a.title),
		...target.map(a => a.url),
	])
	source = source.filter(({ title, url }) => {
		if (seen.has(title) || seen.has(url)) {
			log('duplicate:', title)
			return false
		}
		seen.add(title)
		seen.add(url)
		return true
	})
	target.push(...source)
	return target
}

export async function load() {
	log('Loading', feeds.length, 'feeds...')
	let raw = await Promise.all(feeds.map(get))
	// raw.forEach((xml, i) => fs.writeFileSync(`feed-${i}.xml`, xml))
	let n = news.length
	mergeInto(news, raw.flatMap(parse))
	log('\ngot', news.length, `(+${news.length - n})`, 'articles')
	return news
}
