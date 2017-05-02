var specs = [
	'./form/form.validations.spec.js',
	'./form/form.submitform.spec.js'
];

for (var i = specs.length - 1; i >= 0; i--) {
	require(specs[i]);
};
