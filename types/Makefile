.PHONY: clean_types update_types build_types refresh_types repofetch_types default_types softDefault_types reposetup_types
.ONESHELL:

default_types: clean_types update_types build_types refresh_types

softDefault_types: clean_types refresh_types
reposetup_types: repofetch_types default_types

PF2E_REPO_PATH ?= $(shell node -e 'console.log(JSON.parse(require("fs").readFileSync("../foundryconfig.json")).pf2eRepoPath);')

update_types:
	cd ${PF2E_REPO_PATH}
	git fetch --tags
	latestTag=$$(git describe --tags `git rev-list --tags --max-count=1`)
	git checkout $$latestTag

clean_types:
	cd types
	rm -rf {build,foundry,src,tests,types/foundry,vite.config.d.ts,*.json}

build_types:
	cd ${PF2E_REPO_PATH}
	npm run clean
	npm ci
	npm run build
	node_modules/.bin/tsc --declaration true --emitDeclarationOnly true --noemit false --outdir dist/types --newLine lf

refresh_types:
	cd types
	cp -r ${PF2E_REPO_PATH}/dist/types/* .
	cp -r ${PF2E_REPO_PATH}/types/foundry types
	cp ${PF2E_REPO_PATH}/static/lang/*.json .
	#patch -p1 -i "type-additions.patch"
	find . -type f -name "*.ts" -print0 | xargs -0 sed -i '' -e 's/types\/foundry/@typed-foundry\/foundry/g'

repofetch_types:
	git clone https://github.com/foundryvtt/pf2e.git ${PF2E_REPO_PATH}
