import { cleanup } from './cleanup.ts'
import { load } from './load.ts'
import { summarize } from './summarize.ts'
import { output } from './output.ts'

if (process.argv[2] === 'fresh') {
	cleanup()
}

await load()
await summarize()
await output()
