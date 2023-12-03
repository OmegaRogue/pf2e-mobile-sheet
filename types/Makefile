.PHONY: clean_types update_types build_types refresh_types repofetch_types default_types softDefault_types reposetup_types
.ONESHELL:

default_types: clean_types update_types build_types refresh_types

softDefault_types: clean_types refresh_types
reposetup_types: repofetch_types default_types

update_types:
	cd ${foundrypf2eloc}
	git fetch --tags
	latestTag=$$(git describe --tags `git rev-list --tags --max-count=1`)
	git checkout $$latestTag

clean_types:
	cd types
	rm -rf {build,foundry,src,tests,types,vite.config.d.ts,*.json}

build_types:
	cd ${foundrypf2eloc}
	npm run clean
	npm ci
	npm run build
	node_modules/.bin/tsc --declaration true --emitDeclarationOnly true --noemit false --outdir dist/types --newLine lf

refresh_types:
	cd types
	cp -r ${foundrypf2eloc}/dist/types/* .
	cp -r ${foundrypf2eloc}/types/foundry types
	cp ${foundrypf2eloc}/static/lang/*.json .
	patch -p1 -i "type-additions.patch"

repofetch_types:
	git clone https://github.com/foundryvtt/pf2e.git ${foundrypf2eloc}
