var expect = require('chai').expect
var base = process.env.BASE_IIGB_URL;


describe('IIGB geo redirect Functionality', function() {
	it('redirects me to int', function() {
		browser
			.url(base)
			.pause(10000);
		expect(browser.getUrl(), 'redirected url').to.equal(base + "/int/");
	});
});
