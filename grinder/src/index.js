import { cleanup } from './1.cleanup.js'
import { load } from './load.js'
import { summarize } from './2.summarize.js'
import { slides } from './3.slides.js'
import { audio } from './4.audio.js'

if (process.argv[2] === 'fresh') {
	cleanup()
}
await load()
await summarize()
await slides()
await audio()
