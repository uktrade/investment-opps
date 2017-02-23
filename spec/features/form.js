var expect = require('chai').expect

describe('IIGB Form Functionality', function() {
	it('validates 4 fields on form page one', function() {
		browser
			.url('https://invest.great.gov.uk/int/contact')
			.waitForExist('form');

		browser
			.setValue("form input[name='user[email]']", 'cbakbckasbckhd')
			.setValue("form input[name='user[phone]']", '999');
		browser.pause(500);
		browser
			.click('.nextBtn');
		browser.pause(500);

		browser.elements('.error-help', '.cities', function(err, res) {
			res.value.ELEMENT.forEach(function(elemID) {
				console.log(res.value);
				client.elementIdText(elemID, function(err, res) {
					console.log(res.value);
				});
			});
		});

	});
});
