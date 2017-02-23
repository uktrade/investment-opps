var specs = [
	'./search/search.results.spec.js'
	,
	'./search/search.noresults.spec.js'
	];

for (var i = specs.length - 1; i >= 0; i--) {
	require(specs[i]);
};
