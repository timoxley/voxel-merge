build: index.js
	@mkdir -p build
	@browserify --fast > build/build.js

test: index.js test/merge.js
	browserify --fast -e test/merge.js > test/build.js
