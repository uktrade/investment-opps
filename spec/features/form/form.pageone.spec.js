var expect = require('chai').expect

//TODO use url base from env vars in url

describe('IIGB Form Functionality', function() {
	it('validates 4 fields on form page one', function() {

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
			.setValue("form input[name='user[email]']", 'cbakbckasbckhd')
			.setValue("form input[name='user[phone]']", '999');
		browser.pause(500);
		browser
			.click('.nextBtn');
		browser.pause(2000);

		expect(browser.getText('.active-selection')).to.eq("1");

		var help = browser.elements('#step-1 .has-error');
		console.log(help.value.length);
		expect(help.value.length).to.eq(3);

		var validation = browser.elements('#step-1 .validation_error');
		console.log(validation.value.length);
		expect(validation.value.length).to.eq(2);
	});
});
