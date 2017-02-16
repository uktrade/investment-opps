var expect = require('chai').expect

describe('IIGB Search Functionality', function() {
	it('returns no results with fake search term', function() {
		browser
			.url('https://invest.great.gov.uk/int/industries')
			.waitForExist('body');

		var searchInput = $('#searchInput')
		var searchResults = $('#search-options')
		var searchTerm = 'xbiasbxksbkha'

		browser.click('.navbar-toggle');
		browser.click('#searchBtn');
		searchInput.waitForVisible(5000);
		searchInput.setValue(searchTerm);

		searchResults.waitForVisible(10000);

		var noResults = browser.getValue('#search-options > h3');

		console.log(noResults);

		expect('#search-options > h3', 'no results found string').to.contain(searchTerm);
	});
});
