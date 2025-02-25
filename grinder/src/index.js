import { cleanup } from './0.cleanup.js'
import { load } from './1.load.js'
import { summarize } from './2.summarize.js'
import { slides } from './3.slides.js'
import { audio } from './4.audio.js'

await cleanup()
await load()
await summarize()
await slides()
await audio()
