
.PHONY: clean default update refresh build
.ONESHELL:

DATA_PATH := $(shell node -e 'console.log(JSON.parse(require("fs").readFileSync("foundryconfig.json")).dataPath.join(" "));')
PF2E_REPO_PATH := $(shell node -e 'console.log(JSON.parse(require("fs").readFileSync("foundryconfig.json")).pf2eRepoPath);')

build:
	yarn build
deps:
	yarn install
build_dev:
	yarn build:dev
clean:
	yarn clean
watch:
	yarn watch
hot:
	yarn hot
install:
	for f in ${DATA_PATH}
	do
		ln -s $$(pwd)/dist "$$f/modules/mobile-sheet"
	done
lint:
	yarn lint
lint_ts:
	yarn lint:ts
lint_json:
	yarn lint:json
lint_fix:
	yarn lint:fix

android_debug:
	adb forward tcp:9222 localabstract:chrome_devtools_remote


include types/Makefile
