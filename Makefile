default: test

source_files := $(wildcard src/**/*.ts) $(wildcard src/*.ts)

build/collectedql.umd.js: $(source_files) Makefile tsconfig.json
	./node_modules/.bin/microbundle build -i src/index.ts -o build --format umd --name collectedql --target browser --external process

build/collectedql-post-processed.umd.js: build/collectedql.umd.js
	sed 's/process.env.NODE_ENV/\"production\"/' build/collectedql.umd.js > build/collectedql-post-processed.umd.js

.PHONY: build
build: build/collectedql-post-processed.umd.js

.PHONY: deploy
deploy: build
	cd terraform && terraform apply

.PHONY: test
test:
	@npm t

.PHONY: dev
dev:
	@npm run dev
