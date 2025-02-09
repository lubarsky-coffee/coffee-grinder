import OpenAI from 'openai'

import { log } from './log.ts'
import { load } from './google-sheets.ts'
import { spreadsheetId, aiSheet } from '../config/google-drive.ts'

let openai = new OpenAI()
let assistant
async function initialize() {
	let instructions = (await load(spreadsheetId, aiSheet)).map(x => x.join('\t')).join('\n')
	assistant = await openai.beta.assistants.create({
		name: "Summarizer",
		instructions,
		model: "gpt-4o",
	})
}
let init = initialize()

export async function ai(title, source, text) {
	await init
	for (let i = 0; i < 3; i++) {
		let thread = await openai.beta.threads.create()
		title = title.replace(` - ${source}`, '')
		const message = await openai.beta.threads.messages.create(thread.id, {
			role: "user",
			content: `${title}\n${source}\n\n${text}`,
		})
		let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
			assistant_id: assistant.id,
		})
		if (run.status === 'completed') {
			const messages = await openai.beta.threads.messages.list(run.thread_id)
			// log(run)
			// log(messages.data[0].content)
			let json = messages.data[0].content[0].text.value.replace('```json', '').replace('```', '')
			let res = JSON.parse(json)
			log('got', res.summary.length, 'chars,', run.usage.total_tokens, 'tokens used')
			res.delay = run.usage.total_tokens / 30e3 * 60e3
			return res
		} else {
			log('failed to summarize', run.last_error || run)
		}
	}
}