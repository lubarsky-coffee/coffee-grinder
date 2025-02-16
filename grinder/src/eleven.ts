import { ElevenLabsClient } from "elevenlabs"
import { createWriteStream } from 'fs'

import { log } from './log.ts'

const client = new ElevenLabsClient()

export async function speak(id, text: string) {
	return new Promise<void>(async resolve => {
		let error = e => {
			log(e)
			resolve()
		}
		try {
			let audio = await client.textToSpeech.convert('m86umBOshUanEAvY8HCs', {
				text,
				model_id: "eleven_multilingual_v2",
			})
			let fileStream = createWriteStream(`../audio/${id}.mp3`)
			audio.pipe(fileStream);
			fileStream.on('finish', resolve)
			fileStream.on('error', error)
		} catch(e) {
			error(e)
		}
	})
}
