var expect = require('chai').expect
var base = process.env.BASE_IIGB_URL;


//TODO use url base from env vars in url

describe('IIGB Form Functionality', function() {
	it('validates 2 fields on form', function() {

		browser
			.url(base + '/int/contact')
			.waitForExist('form');

		browser
			.setValue("form input[name='user[name]']", 'browser stack')
			.setValue("form input[name='user[title]']", 'browser stack')
			.setValue("form input[name='user[email]']", 'browser@stack.com')
			.setValue("form input[name='user[phone]']", '4402074355599')
			.setValue("form input[name='organisation[name]']", 'utopia')
			.setValue("form input[name='organisation[headquarters_country]']", 'utopia')
			.setValue("form input[name='organisation[website]']", 'utopia.com')
			.setValue("form input[name='investment[project]']", 'This company plan to invest millions in the uk over the next few years.')			
			.click("#10 to 50");
		browser.pause(500);

		browser
			.click("form input[type='submit']");
		browser.pause(500);

			browser.waitUntil(function() {
			return browser.getUrl().includes("enquiries")
		}, 7000, 'expected url to be different after 7s');

		console.log(browser.getUrl());
		expect(browser.getUrl()).to.contain('confirmation');
	});
});
