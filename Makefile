deploy:
	cd terraform && terraform apply

tests-build/piping.mjs: funcs.test.js funcs.js
	@./node_modules/.bin/microbundle build -i funcs.test.js -o tests-build --format es --name piping

test:
	@make tests-build/piping.mjs > /dev/null
	@node run-tests.js