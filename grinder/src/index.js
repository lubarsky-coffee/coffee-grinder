import { news } from './store.js'
import { sleep } from './sleep.js'
// import { cleanup } from './1.cleanup.js'
import { load } from './load.js'
import { summarize } from './2.summarize.js'
// import { slides } from './3.slides.js'
// import { audio } from './4.audio.js'

// if (process.argv[2] === 'fresh') {
// 	cleanup()
// }

// news.forEach((e, i) => news[i] = {})
// await sleep(1)
// news.length = 0

// await load()
await summarize()
await slides()
await audio()
