import OpenAI from 'openai'

import { log } from './log.ts'
import { summarizer as instructions } from '../config/instructions.ts'

let openai = new OpenAI()

const assistant = await openai.beta.assistants.create({
	name: "Summarizer",
	instructions,
	model: "gpt-4o",
})

export async function summarize(title, text) {
	let thread = await openai.beta.threads.create()
	const message = await openai.beta.threads.messages.create(thread.id, {
		role: "user",
		content: `${title}\n\n${text}`,
	})
	let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
		assistant_id: assistant.id,
	})
	if (run.status === 'completed') {
		log('tokens used', run.usage.total_tokens)
		const messages = await openai.beta.threads.messages.list(run.thread_id)
		// log(run)
		// log(messages.data[0].content)
		let json = messages.data[0].content[0].text.value.replace('```json', '').replace('```', '')
		let res = JSON.parse(json)
		res.delay = run.usage.total_tokens / 30e3 * 60e3
		return res
	} else {
		log(run.status)
	}
}