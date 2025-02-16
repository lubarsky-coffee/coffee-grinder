import { JWT } from 'google-auth-library'

import credentials from '../service-account.json' with { type: 'json' }

export let auth = new JWT({
	email: credentials.client_email,
	key: credentials.private_key,
	scopes: [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/presentations',
	],
})
