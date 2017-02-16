exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',

  updateJob: false,
  specs: [
    './spec/features/georedirect.js'
  ],
  exclude: [],

  maxInstances: 5,
  commonCapabilities: {
    name: 'parallel_test',
    build: 'webdriver-browserstack'
  },

  capabilities: [{
      browser: 'chrome'
    }, {
      browser: 'firefox'
    }, {
      'browser': 'IE',
      'browser_version': '8.0',
    }, {
      'browser': 'IE',
      'browser_version': '9.0',
    }, {
      'browser': 'IE',
      'browser_version': '10.0',
    }, {
      'browser': 'IE'
    }, {
      'browser': 'safari',
      'browser_version': '9.0',
    }, {
      browser: 'safari'
    }
    // {
    //   'platform': 'MAC',
    //   'browserName': 'iPhone',
    //   'device': 'iPhone 6'
    // }, {
    //   'browserName': 'android',
    //   'platform': 'ANDROID',
    //   'device': 'Samsung Galaxy S5'
    // }
  ],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 35000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  }
}

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps) {
  for (var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
