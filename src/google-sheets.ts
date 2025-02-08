import Sheets from '@googleapis/sheets'

import { log } from './log.ts'
import { sleep } from './sleep.ts'
import { auth } from './google-auth.ts'

let sheets
async function initialize() {
	sheets = await Sheets.sheets({ version: 'v4', auth }).spreadsheets
}
let init = initialize()

export async function loadSheet(spreadsheetId, range) {
	await init
	const res = await sheets.values.get({ spreadsheetId, range })
	const rows = res.data.values
	// log('Data from sheet:', rows)
	const headers = rows[0]
	const data = rows.slice(1).map(row => {
		let obj = {}
		row.forEach((cell, i) => {
			obj[headers[i]] = cell
		})
		return obj
	})
	data.headers = headers
	return data
}

export async function saveSheet(spreadsheetId, range, data) {
	let { headers } = data
	await init
	const updatedData = [
		headers,
		...data.map(o => headers.map(h => o[h] ?? '')),
	]
	// log({ updatedData })
	const res = await sheets.values.update({
		spreadsheetId,
		range,
		valueInputOption: 'RAW',
		requestBody: { values: updatedData },
	})
}
