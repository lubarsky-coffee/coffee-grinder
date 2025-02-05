import { xml2json } from 'xml-js'

import { log } from './log.ts'
import { news } from './store.ts'
import feeds from '../config/feeds.ts'

async function get(url: string) {
	return await (await fetch(url)).text()
}

function parse(xml) {
	let feed = JSON.parse(xml2json(xml, { compact: true }))
	let items = feed?.rss?.channel?.item?.map(({ title, link, source, description }) => {
		try {
			let json = xml2json(description?._text, { compact: true })
			let articles = JSON.parse(json).ol.li.map(({ a, font }) => ({
				title: a._text,
				url: a._attributes.href,
				source: font._text,
			}))
			return { articles }
		} catch(e) {
			return {
				articles: [{
					title: title?._text,
					url: link?._text,
					source: source?._text,
				}]
			}
		}
	})
	return items
}

function mergeInto(target, source) {
	let index = {}
	let add = event => event.articles.forEach(a => {
		index[a.title] = event
		index[a.url] = event
	})
	target.forEach(add)
	source.forEach(event => {
		if (event.articles.some(a => index[a.title] || index[a.url])) return
		add(event)
		target.push(event)
	})
	return target
}

export async function load() {
	log('Loading', feeds.length, 'feeds...')
	let raw = await Promise.all(feeds.map(get))
	// raw.forEach((xml, i) => fs.writeFileSync(`feed-${i}.xml`, xml))
	let newsN = news.length
	let articlesN = news.flatMap(n => n.articles).length
	mergeInto(news, raw.flatMap(parse))
	let articles = news.flatMap(n => n.articles)
	log('\ngot', articles.length, `(+${articles.length - articlesN})`, 'articles', 'for', news.length, `(+${news.length - newsN})`, 'events')
	return news
}
