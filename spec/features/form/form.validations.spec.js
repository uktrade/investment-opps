var base = process.env.BASE_IIGB_URL;

var expect = require('chai').expect

//TODO use url base from env vars in url

describe('IIGB Form Functionality', function() {
	it('validates 6 fields on form', function() {

		browser
			.url(base + '/int/contact')
			.waitForExist('form');

		browser
			.setValue("form input[name='user[email]']", 'cbakbckasbckhd')
			.setValue("form input[name='user[phone]']", '999');
		browser.pause(500);
		browser
			.click('#company_name');
		browser.pause(2000);

		var validation = browser.elements('.error-help');
		console.log(validation.value.length);
		expect(validation.value.length).to.eq(2);
	});
});
