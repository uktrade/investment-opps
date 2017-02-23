var expect = require('chai').expect

describe('IIGB Search Functionality', function() {
	it('returns no results with fake search term', function() {
		browser
			.url('https://invest.great.gov.uk/int/industries')
			.waitForExist('body');

		var searchInput = $('#searchInput')
		var searchTerm = 'xbiasbxksbkha'
		browser.click('.navbar-toggle');
		browser.waitForExist('#searchBtn');
		browser.click('#searchBtn');
		searchInput.waitForVisible(5000);
		searchInput.setValue(searchTerm);
		browser.pause(5000);
		expect(browser.isVisible('.search-result', 'Search results are not visible')).to.equal(false);
	});
});
