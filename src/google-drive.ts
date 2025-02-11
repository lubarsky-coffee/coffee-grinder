import Drive from '@googleapis/drive'

import { log } from './log.ts'
import { sleep } from './sleep.ts'
import { auth } from './google-auth.ts'

let drive
async function initialize() {
	drive = await Drive.drive({ version: 'v3', auth })
}
let init = initialize()

export async function createFolder(folderId, name) {
	await init
	const file = await drive.files.create({	resource: {
		'parents': [folderId],
		name,
		'mimeType': 'application/vnd.google-apps.folder',
	}})
    return file.data.id
}

export async function getFile(folderId, name) {
	await init
	let files = (await drive.files.list({
		q: `'${folderId}' in parents and name = '${name}'`,
	})).data.files
	return files[0]
}

export async function trashFile(fileId) {
	await init
	return drive.files.trash({ fileId })
}

export async function copyFile(fileId, folderId, name) {
	await init
	let res = await drive.files.copy({
		fileId,
		requestBody: {
			name,
			parents: [folderId],
		},
	})
	return res.data
}