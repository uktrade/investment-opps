var expect = require('chai').expect

describe('IIGB Form Functionality', function() {
	it('validates 4 fields on form page one', function() {
		browser
			.url('https://invest.great.gov.uk/int/industries')
			.pause(5000);
		var form = $('#dit-form');

		form.scroll(0, 0);

	});
});
