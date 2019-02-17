default: test

source_files := $(wildcard src/*.ts)

build/piping.umd.js: $(source_files) Makefile tsconfig.json
	./node_modules/.bin/microbundle build -i src/index.ts -o build --format umd --name piping --target browser --external process

build/piping-post-processed.umd.js: build/piping.umd.js
	sed 's/process.env.NODE_ENV/\"production\"/' build/piping.umd.js > build/piping-post-processed.umd.js

.PHONY: build
build: build/piping-post-processed.umd.js

.PHONY: deploy
deploy: build
	cd terraform && terraform apply

.PHONY: test
test:
	@npm t

.PHONY: dev
dev:
	@npm run dev
