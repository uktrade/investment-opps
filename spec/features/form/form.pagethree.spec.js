var expect = require('chai').expect

//TODO use url base from env vars in url

describe('IIGB Form Functionality', function() {
	it('validates 4 fields on form page 3', function() {

		if (!browser.isMobile) {
			browser.windowHandleSize({
				width: 1600,
				height: 1200
			});
			browser.pause(2000);
		}

		browser
			.url('https://invest.great.gov.uk/int/contact')
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
			.click('#step-3 .submitBtn');

		expect(browser.getText('.active-selection')).to.eq("3");

		var help = browser.elements('#step-3 .has-error');
		console.log(help.value.length);
		expect(help.value.length).to.eq(3);

	});
});
