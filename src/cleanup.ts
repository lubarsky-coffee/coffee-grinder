import { news } from './store.ts'
import { deletePresentation } from './google-slides.ts'

export async function cleanup() {
	news.length = 0
	deletePresentation()
}

if (process.argv[1].endsWith('cleanup.ts')) cleanup()