default: test

source_files := $(wildcard src/*.ts)

build/piping.umd.js: $(source_files) Makefile tsconfig.json
	./node_modules/.bin/microbundle build -i src/index.ts -o build --format umd --name piping

.PHONY: build
build: build/piping.umd.js

.PHONY: deploy
deploy: build
	cd terraform && terraform apply

.PHONY: test
test:
	@npm t
