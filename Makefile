default: test

build/piping.umd.js: index.ts funcs.ts Makefile
	@./node_modules/.bin/microbundle build -i index.ts -o build --format umd --name piping

deploy: build/piping.umd.js
	cd terraform && terraform apply

tests-build/piping.umd.js: funcs.test.ts funcs.ts Makefile
	@./node_modules/.bin/microbundle build -i funcs.test.ts -o tests-build --format umd --name piping

test:
	@make tests-build/piping.umd.js > /dev/null
	@node run-tests.js
