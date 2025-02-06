import Slides from '@googleapis/slides'
import Drive from '@googleapis/drive'
import { nanoid } from 'nanoid'

import { log } from './log.ts'
import credentials from '../service-account.json' with { type: 'json' }
import { folderId, templatePresentationId, templateSlideId } from '../config/drive.ts'

let slides, drive, presentationId

async function init() {
	const auth = new Slides.auth.JWT({
		email: credentials.client_email,
		key: credentials.private_key,
		scopes: [
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/presentations',
		],
	})
	await auth.authorize()
	slides = Slides.slides({ version: 'v1', auth })
	drive = Drive.drive({ version: 'v3', auth })
	let files = (await drive.files.list({
		q: `'${folderId}' in parents and name = 'today'`,
	})).data.files
	presentationId = files[0]?.id
}
let initialization = init()

export async function deletePresentation() {
	await initialization
	if (!presentationId) return
	await drive.files.delete({ fileId: presentationId })
	presentationId = null
}

export async function presentationExists() {
	await initialization
	return presentationId
}

export async function createPresentation() {
	await initialization
	if (!presentationId) {
		log('Creating presentation...\n')
		let res = await drive.files.copy({
			fileId: templatePresentationId,
			requestBody: {
				name: 'today',
				parents: [folderId],
			},
		})
		presentationId = res.data.id
	}
	return presentationId
}

export async function addSlide(event) {
	let newSlideId = 'n' + nanoid()

	let replace = {
		'{{title}}': `${event.title} - ${event.source}`,
		'{{source}}': event.source,
		'https://original.url': event.url,
		'{{summary}}': `${event.summary}\n${event.url}`,
		'{{sqk}}': event.sqk,
		'{{categoryId}}': event.categoryId,
	}
	let requests = [
		{
			duplicateObject: {
				objectId: templateSlideId,
				objectIds: {
					[templateSlideId]: newSlideId,
				},
			}
		},
		...Object.entries(replace).map(([key, value]) => ({
			replaceAllText: {
				containsText: {	text: key },
				replaceText: String(value),
				pageObjectIds: [newSlideId],
			}
		})),
		{
			replaceAllText: {
				containsText: {	text: `{{cat${event.categoryId}_card${event.categorySqk}}}` },
				replaceText: String(`${event.sqk} ${event.title}`),
			}
		},
		{
			updateSlidesPosition: {
				slideObjectIds: [templateSlideId],
				insertionIndex: event.sqk + 3,
			}
		},
	]
	// log(requests)
	try {
		const result = await slides.presentations.batchUpdate({
			presentationId,
			requestBody: { requests },
		})
		// log(result)
	} catch (e) {
		log(e)
	}
}