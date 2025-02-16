import Slides from '@googleapis/slides'
import { nanoid } from 'nanoid'

import { log } from './log.ts'
import { sleep } from './sleep.ts'
import { auth } from './google-auth.ts'
import { copyFile, moveFile, getFile } from './google-drive.ts'
import { rootFolderId, presentationName, templatePresentationId, templateSlideId, templateTableId, archiveFolderId } from '../config/google-drive.ts'

let slides, presentationId
async function initialize() {
	slides = await Slides.slides({ version: 'v1', auth })
	presentationId = (await getFile(rootFolderId, presentationName))?.id
}
let init = initialize()

export async function archivePresentation(name) {
	await init
	if (!presentationId) return
	log('Archiving presentation...')
	await moveFile(presentationId, archiveFolderId, name)
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
		presentationId = (await copyFile(templatePresentationId, rootFolderId, presentationName)).id
	}
	return presentationId
}

export async function addSlide(event) {
	let newSlideId = 's' + nanoid()
	// let title = `${event.titleEn || event.titleRu} | ${event.source}`
	let title = `${event.titleEn || event.titleRu}`
	let replace = {
		'{{title}}': title,
		'{{summary}}': event.summary,
		'{{sqk}}': event.sqk,
		'{{priority}}': event.priority,
		'{{notes}}': event.notes,
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
					endIndex: 9,
				},
				style: {
					link: {
						url: event.directUrl || event.url
					},
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
				containsText: {	text: `{{cat${event.topicId}_card${event.topicSqk}}}` },
				replaceText: String(`${event.sqk} ${title}`),
			}
		},
		{
			updateSlidesPosition: {
				slideObjectIds: [templateSlideId],
				insertionIndex: +event.sqk + 1,
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