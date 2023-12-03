
.PHONY: clean default update refresh build
.ONESHELL:


install:
	yarn install
build:
	yarn build
build_dev:
	yarn build:dev
clean:
	yarn clean
watch:
	yarn watch
hot:
	yarn hot
lint:
	yarn lint
lint_ts:
	yarn lint:ts
lint_json:
	yarn lint:json
lint_fix:
	yarn lint:fix

include types/Makefile
