var expect = require('chai').expect

describe('IIGB Search Functionality', function() {
	it('returns results for "finance"', function() {
		browser
			.url('https://invest.great.gov.uk/int/industries')
			.waitForExist('body');

		var searchInput = $('#searchInput')
		var searchResult = $('.search-result')

		browser.click('.navbar-toggle');
		browser.waitForExist('#searchBtn');
		browser.click('#searchBtn');
		searchInput.waitForVisible(5000);
		searchInput.setValue('finance');

		searchResult.waitForVisible(5000);

		browser.elements('.search-result', function(err, res) {
			expect(res.value.length, 'redirected url').to.be.above(1);
		});
	});
});
