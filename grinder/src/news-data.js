import { log } from './log.js'

function parseDate(date) {
	date = date.replace(' ', 'T') + 'Z'
	return new Date(date)
}

let baseUrl = `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_DATA_API_KEY}&`
export default async function fetchNews(params) {
	let defaults = {
		prioritydomain: 'top',
		removeduplicate: 1,
		// timeframe: 24,
		// full_content: 1,
	}
	let { timeframe, sourcePriority } = params
	delete params.ref
	delete params.timeframe
	delete params.sourcePriority
	params = Object.assign(defaults, params)
	let cutoff = Date.now() - (timeframe || 24) * 60 * 60e3
	let results = []
	for (let i = 0; i < 99; i++) {
		let url = baseUrl + new URLSearchParams(params)
		let res = await fetch(url)
		let json = await res.json()
		if (json.status === "success") {
			let timeframed = json.results.filter(e => parseDate(e.pubDate) >= cutoff)
			let res = timeframed.filter(e => e.source_priority <= sourcePriority || 9e9)
			results.push(...res)
			if (timeframed.length < json.results.length) break
		} else {
			log('NewsData API error\n', json)
		}
		if (!json.nextPage) break
		params.page = json.nextPage
	}
	return results
}