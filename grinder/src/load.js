import fs from 'fs'

import { log } from './log.js'
import { news } from './store.js'
import feeds from '../config/news-data-feeds.js'
import fetchNews from './news-data.js'

function mergeInto(target, source) {
	let index = {}
	let seen = event => {
		index[event.title] = event
	}
	target.forEach(seen)
	source.forEach(event => {
		if (index[event.title] || index[event.url]) return
		seen(event)
		target.push(event)
	})
	return target
}

export async function load() {
	let queries = Object.entries(feeds).slice(0, 1).flatMap(([topic, queries]) =>
		queries.map((q, i) => ({ ...q, ref: `${topic}#${i}` }))
	)
	log(queries)
	log('Loading', queries.length, 'feeds...')
	let raw = await Promise.all(queries.map(fetchNews))
	log('raw', raw)
	let incoming = raw.flatMap((r, i) => {
		log('queries[i]', queries[i])
		return r.map(e => ({
		...e,
		url: e.link,
		ref: queries[i].ref,
		source: e.source_name,
		categories: e.category?.join(','),
		keywords: e.keywords?.join(','),
	}))})
	let newsN = news.length
	mergeInto(news, incoming)
	log('\ngot', news.length, `(+${news.length - newsN})`, 'events')
	return news
}

if (process.argv[1].endsWith('load')) load()
