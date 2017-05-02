var expect = require('chai').expect
var base = process.env.BASE_IIGB_URL;


describe('IIGB Search Functionality', function() {
	it('returns results for "finance"', function() {
		browser
			.url(base + '/int/industries')
			.waitForExist('body');

		var searchInput = $('#searchInput')
		var searchResult = $('.search-result')

		if (browser.isVisible('.navbar-toggle')) {
			browser.click('.navbar-toggle');
			browser.pause(2000);
		}

		browser.waitForExist('#searchBtn');
		browser.click('#searchBtn');
		searchInput.waitForVisible(5000);
		searchInput.setValue('finance');

		searchResult.waitForVisible(10000);

		browser.elements('.search-result', function(err, res) {
			expect(res.value.length, 'redirected url').to.be.above(1);
		});
	});
});
