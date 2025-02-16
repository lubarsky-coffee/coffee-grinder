import { cleanup } from './1.cleanup.ts'
import { load } from './load.ts'
import { summarize } from './2.summarize.ts'
import { output } from './3.slides.ts'

if (process.argv[2] === 'fresh') {
	cleanup()
}
await load()
await summarize()
await output()
