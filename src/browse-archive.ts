import { chromium } from 'playwright'
import os from 'os'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { log } from './log.ts'
import { sleep } from './sleep.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let context
async function initialize() {
	const chromeProfilePath = `${os.homedir()}/AppData/Local/Google/Chrome/User Data`
	// log(`Chrome profile path: ${chromeProfilePath}`)
	let extension = `${__dirname}/../extensions/captcha-solver/0.2.1_0`
	context = await chromium.launchPersistentContext(chromeProfilePath, {
		headless: false,
		executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		args: [
			'--start-maximized',
			`--disable-extensions-except=${extension}`,
			`--load-extension=${extension}`,
		],
	})
}

export function finalyze() {
	context?.close()
}

export async function browseArchive(url) {
	if (!context) await initialize()
	try {
		log('Browsing archive...')
		let page = await context.newPage()
		url = 'https://archive.ph/' + url.split('?')[0]
		await page.goto(url, { waitUntil: 'networkidle' })

		let captcha = await page.$('iframe[src*="recaptcha"]')
		if (captcha) {
			log('waiting for captcha to be solved...')
			await page.waitForSelector('#CONTENT', { timeout: 180e3 })
			log('captcha solved')
		} else {
			log('no captcha detected')
		}

		const versions = await page.$$('.TEXT-BLOCK > a')
		if (versions.length > 0) {
			log('going to the newest version...')
			await versions[0].click()
			await page.waitForLoadState('networkidle')
		}

		let html =  await page.evaluate(() => {
			return [...document.querySelectorAll('.body')].map(x => x.innerHTML).join('')
		})
		return html
	}
	catch (e) {
		log('Archive browsing failed', e)
	}
}
