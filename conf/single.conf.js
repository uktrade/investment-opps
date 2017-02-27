exports.config = {
	user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
	key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',

	updateJob: false,
	specs: [
		'./spec/features/search.js',
		'./spec/features/form.js',
		'./spec/features/georedirect.js'
	],
	exclude: [],

	capabilities: [{
			browser: 'chrome',
			'resolution': '1600x1200',
			name: 'single_test',
			build: 'webdriver-browserstack'
		},
		// {
		// 	'os': 'Windows',
		// 	'os_version': '7',
		// 	'browser': 'IE',
		// 	'browser_version': '9.0',
		// 	'resolution': '1600x1200',
		// 	name: 'internet_explorer_9',
		// 	build: 'webdriver-browserstack'
		// }
	],

	logLevel: 'verbose',
	coloredLogs: true,
	screenshotPath: './errorShots/',
	baseUrl: '',
	waitforTimeout: 100000,
	connectionRetryTimeout: 90000,
	connectionRetryCount: 3,

	framework: 'mocha',
	mochaOpts: {
		ui: 'bdd',
		timeout: 45000
	}
}
