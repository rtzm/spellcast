REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000 --compilers js:babel-core/register

.PHONY: test
