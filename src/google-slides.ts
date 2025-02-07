import Slides from '@googleapis/slides'
import { nanoid } from 'nanoid'

import { log } from './log.ts'
import { sleep } from './sleep.ts'
import { auth } from './google-auth.ts'
import { copyFile, deleteFile, findFile } from './google-drive.ts'
import { folderId, presentationName, templatePresentationId, templateSlideId, templateTableId } from '../config/google-drive.ts'

let slides, presentationId
async function initialize() {
	slides = await Slides.slides({ version: 'v1', auth })
	presentationId = (await findFile(folderId, 'today'))?.id
}
let init = initialize()

export async function deletePresentation() {
	await init
	if (!presentationId) return
	log('Deleting presentation...')
	await deleteFile(presentationId)
	presentationId = null
}

export async function presentationExists() {
	await init
	return presentationId
}

export async function createPresentation() {
	await init
	if (!presentationId) {
		log('Creating presentation...\n')
		presentationId = (await copyFile(templatePresentationId, folderId, presentationName)).id
	}
	return presentationId
}

export async function addSlide(event) {
	let newSlideId = 's' + nanoid()
	// let newTableId = 't' + nanoid()
	let { title } = event
	if (!title.endsWith(event.source)) {
		title += ` - ${event.source}`
	}
	let replace = {
		'{{title}}': title,
		'{{source}}': event.source,
		'https://original.url': event.url,
		'{{summary}}': event.summary,
		'{{sqk}}': event.sqk,
		'{{categoryId}}': event.categoryId,
		'{{priority}}': event.priority,
	}
	let requests = [
		{
			updateTextStyle: {
				fields: 'link',
				objectId: templateTableId,
				cellLocation: {
					rowIndex: 0,
					columnIndex: 0
				},
				textRange: {
					type: "FIXED_RANGE",
					startIndex: 0,
					endIndex: 9 //title.length,
				},
				style: {
					link: {	url: event.url },
				},
			},
		},
		{
			duplicateObject: {
				objectId: templateSlideId,
				objectIds: {
					[templateSlideId]: newSlideId,
					// [templateTableId]: newTableId,
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
	for (let i = 0; i < 3; i++) {
		try {
			const result = await slides.presentations.batchUpdate({
				presentationId,
				requestBody: { requests },
			})
			return
			// log(result)
		} catch (e) {
			log(e)
			await sleep(60e3)
		}
	}
}

if (process.argv[1].endsWith('google-slides.ts')) {
	// await init
	// const res = await slides.presentations.get({ presentationId: templatePresentationId })
	// console.log(JSON.stringify(res.data.slides[res.data.slides.length - 1], null, 2))
	// const res = await slides.presentations.get({ presentationId: presentationId })
	// console.log(res.data.slides[res.data.slides.length - 2])
}