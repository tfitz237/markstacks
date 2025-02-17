module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,png,html}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};