import { log } from './log.ts'

export async function fetchArticle(url) {
	for (let i = 0; i < 3; i++) {
		try {
			let response = await fetch(url)
			if (response.ok) {
				return await response.text()
			} else {
				log('article fetch failed', response.status, response.statusText)
				return
			}
		} catch(e) {
			log('article fetch failed', e)
		}
	}
	// let response
	// if (paywalled.some(u => url.includes(u))) {
	// 	url = 'https://archive.ph/' + url
	// 	log(url)
	// 	response = await fetch(url)
	// } else {
	// 	response = await fetch(url)
	// 	if (!response.ok) {
	// 		log(response.status, response.statusText)
	// 		url = 'https://archive.ph/' + url
	// 		log(url)
	// 		response = await fetch(url)
	// 	}
	// }
	// if (response.ok) {
	// 	return await response.text()
	// } else {
	// 	log('article fetch failed', response.status, response.statusText)
	// }
}