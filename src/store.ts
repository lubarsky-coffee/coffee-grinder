import fs from 'fs'
import { proxy, subscribe } from 'valtio/vanilla'

export let news = []
try {
	news = JSON.parse(fs.readFileSync('news.json', 'utf8'))
} catch(e) {}
news = proxy(news)
subscribe(news, () => fs.writeFileSync('news.json', JSON.stringify(news, null, 2)))
