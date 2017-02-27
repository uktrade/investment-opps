exports.config = {
	user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
	key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',

	updateJob: false,
	specs: [
		// './spec/features/search.js',
		'./spec/features/form.js'
	],
	exclude: [],

	capabilities: [{
		browser: 'chrome',
		'resolution': '1280x1024',
		name: 'single_test',
		build: 'webdriver-browserstack'
	}],

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
		timeout: 20000
	}
}
