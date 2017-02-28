var expect = require('chai').expect

describe('IIGB Search Functionality', function() {
	it('returns results for "finance"', function() {
		if (!browser.isMobile) {
			browser.windowHandleSize({
				width: 1600,
				height: 1200
			});
			browser.pause(2000);
		}
		browser
			.url('https://invest.great.gov.uk/int/industries')
			.waitForExist('body');

		var searchInput = $('#searchInput')
		var searchResult = $('.search-result')

		if (browser.isMobile) {
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
