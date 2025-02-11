import { news, save } from './store.ts'
import { deletePresentation } from './google-slides.ts'
import { sleep } from './sleep.ts'

export async function cleanup() {
	news.forEach((e, i) => news[i] = {})
	await sleep(1)
	news.length = 0
	deletePresentation()
}

if (process.argv[1].endsWith('cleanup.ts')) cleanup()