import Drive from '@googleapis/drive'

import { log } from './log.ts'
import { auth } from './google-auth.ts'

async function initialize() {
	return await Drive.drive({ version: 'v3', auth })
}
let init = initialize()

export async function createFolder(folderId, name) {
	let drive = await init
	const file = await drive.files.create({	resource: {
		'parents': [folderId],
		name,
		'mimeType': 'application/vnd.google-apps.folder',
	}})
    return file.data.id
}

export async function getFile(folderId, name) {
	let drive = await init
	let files = (await drive.files.list({
		q: `'${folderId}' in parents and name = '${name}'`,
	})).data.files
	return files[0]
}

export async function moveFile(fileId, newFolderId, newName = null) {
	let drive = await init
	const res = await drive.files.get({
		fileId: fileId,
		fields: 'parents, name'
	})
	await drive.files.update({
		fileId: fileId,
		removeParents: res.data.parents,
		addParents: newFolderId,
		resource: {
			name: newName || res.data.name,
		},
	})
}

export async function trashFile(fileId) {
	let drive = await init
	await drive.files.update({
		fileId: fileId,
		resource: { trashed: true },
	})
}

export async function copyFile(fileId, folderId, name) {
	let drive = await init
	let res = await drive.files.copy({
		fileId,
		requestBody: {
			name,
			parents: [folderId],
		},
	})
	return res.data
}