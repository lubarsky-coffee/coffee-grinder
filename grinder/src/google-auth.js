import { JWT } from 'google-auth-library'

export let auth = new JWT({
	email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
	scopes: [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/presentations',
	],
})
