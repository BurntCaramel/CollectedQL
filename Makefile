default: test

build/piping.umd.js: index.ts funcs.ts Makefile
	@./node_modules/.bin/microbundle build -i index.ts -o build --format umd --name piping

deploy: build/piping.umd.js
	cd terraform && terraform apply

test:
	@npm t
