import { log } from './log.ts'
import paywalled from '../config/paywall.ts'

export async function fetchArticle(url) {
	let response
	if (paywalled.some(u => url.includes(u))) {
		url = 'https://archive.ph/' + url
		log(url)
		response = await fetch(url)
	} else {
		response = await fetch(url)
		if (!response.ok) {
			log(response.status, response.statusText)
			url = 'https://archive.ph/' + url
			log(url)
			response = await fetch(url)
		}
	}
	if (response.ok) {
		return await response.text()
	} else {
		log(response.status, response.statusText)
	}
}