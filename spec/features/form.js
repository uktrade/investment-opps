var specs = [
	'./form/form.pageone.spec.js',
	'./form/form.pagetwo.spec.js',
	'./form/form.pagethree.spec.js',
	'./form/form.submitform.spec.js'
];

for (var i = specs.length - 1; i >= 0; i--) {
	require(specs[i]);
};
