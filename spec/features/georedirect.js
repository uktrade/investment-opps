var expect = require('chai').expect

describe('IIGB geo redirect Functionality', function() {
	it('redirects me to int', function() {
		browser
			.url('https://invest.great.gov.uk')
			.pause(10000);
		expect(browser.getUrl(), 'redirected url').to.equal("https://invest.great.gov.uk/int/");
	});
});
