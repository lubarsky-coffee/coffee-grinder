import fs from 'fs'
import { xml2json } from 'xml-js'

import { log } from './log.js'
import { news } from './store.js'
import feeds from '../config/feeds.js'

async function get({ url }) {
	return await (await fetch(url)).text()
}

function parse(xml) {
	// log('Parsing', xml.length, 'bytes...')
	let feed = JSON.parse(xml2json(xml, { compact: true }))
	let items = feed?.rss?.channel?.item?.map(event => {
		return {
			titleEn: event.title?._text, // .replace(` - ${event.source?._text}`, ''),
			source: event.source?._text,
			gnUrl: event.link?._text,
			date: new Date(event.pubDate._text),
		}
		// try {
		// 	let json = xml2json(event.description?._text, { compact: true })
		// 	let articles = JSON.parse(json).ol.li.map(({ a, font }) => ({
		// 		title: a._text,
		// 		url: a._attributes.href,
		// 		source: font._text,
		// 	}))
		// 	return {
		// 		articles,
		// 		pubDate: new Date(event.pubDate._text),
		// 	}
		// } catch(e) {
		// 	return {
		// 		articles: [{
		// 			title: event.title?._text,
		// 			url: event.link?._text,
		// 			source: event.source?._text,
		// 		}],
		// 		pubDate: new Date(event.pubDate._text),
		// 	}
		// }
	})
	return items
}

function mergeInto(target, source) {
	let index = {}
	let seen = event => {
		index[event.titleEn] = event
		index[event.gnUrl] = event
	}
	target.forEach(seen)
	source.forEach(event => {
		if (index[event.titleEn] || index[event.gnUrl]) return
		seen(event)
		target.push(event)
	})
	return target
}

export async function load() {
	log('Loading', feeds.length, 'feeds...')
	let raw = await Promise.all(feeds.map(get))
	let newsN = news.length
	let now = new Date()
	let days = now.getDay() ? 1.5 : 3.5
	let incoming = raw.map(parse)
	.map(a => a.filter(e => e.date > now - days*24*60*60e3))
	.map((a, i) => a.slice(0, feeds[i].max))
	.flat()
	mergeInto(news, incoming)
	news.forEach((e, i) => e.id = e.id ?? i + 1)
	log('\ngot', news.length, `(+${news.length - newsN})`, 'events')
	return news
}

if (process.argv[1].endsWith('load')) load()
