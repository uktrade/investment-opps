var expect = require('chai').expect
var base = process.env.BASE_IIGB_URL;


//TODO use url base from env vars in url

describe('IIGB Form Functionality', function() {
	it('validates 2 fields on form page two', function() {

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

		browser
			.click('#step-2 .nextBtn');

		expect(browser.getText('.active-selection')).to.eq("2");


		var help = browser.elements('#step-2 .has-error');
		console.log(help.value.length);
		expect(help.value.length).to.eq(2);
	});
});
