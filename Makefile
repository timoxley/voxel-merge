test: index.js ./test/merge.js
	browserify --fast -e test/merge.js > test/build.js
