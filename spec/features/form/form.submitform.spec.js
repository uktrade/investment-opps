var expect = require('chai').expect
var base = process.env.BASE_IIGB_URL;


describe('IIGB Form Functionality', function() {
	it('submits a form successfully', function() {

		if (!browser.isMobile) {
			browser.windowHandleSize({
				width: 1600,
				height: 1200
			});
			browser.pause(2000);
		}

		browser
			.url(base + '/int/contact')
			.waitForExist('form');

		browser
			.setValue("form input[name='user[name]']", 'browser stack')
			.setValue("form input[name='user[email]']", 'browser@stack.com')
			.setValue("form input[name='user[city]']", 'utopia')
			.setValue("#country", 'utopia land');
		browser.pause(500);
		browser
			.click('.nextBtn');
		browser.pause(500);

		var month = $('#start_date_month');
		month.selectByValue('2');

		var year = $('#start_date_year');
		year.selectByValue('2017');

		var location = $('#industry');
		location.selectByVisibleText('Aerospace');

		browser
			.click('#step-2 .nextBtn');
		browser.pause(500);

		browser
			.setValue("form input[name='organisation[name]']", 'test');

		var staff = $('#staff');
		staff.selectByVisibleText('Between 10 and 50');

		var turnover = $('#turnover');
		turnover.selectByVisibleText('Under £100,000');

		browser
			.click('#step-3 .submitBtn');

		browser.waitUntil(function() {
			return browser.getUrl().includes("enquiries")
		}, 7000, 'expected url to be different after 7s');

		console.log(browser.getUrl());
		expect(browser.getUrl()).to.contain('confirmation');

	});
});
