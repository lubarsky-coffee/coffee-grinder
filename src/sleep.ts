import { log } from './log.ts'

export function sleep(ms) {
	if (ms <= 0) return
	log('resting', (ms/1e3).toFixed() + 's...')
	return new Promise(resolve => setTimeout(resolve, ms))
}
