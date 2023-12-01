
.PHONY: clean default update refresh build

default: clean update build refresh

softDefault: clean refresh

update:
	cd ${foundrypf2eloc}; \
	git fetch --tags; \
	latestTag=$$(git describe --tags `git rev-list --tags --max-count=1`); \
	git checkout $$latestTag

clean:
	rm -rf ./{build,foundry,src,tests,types,vite.config.d.ts,*.json}

build:
	cd ${foundrypf2eloc}; \
	npm run clean; \
    npm ci; \
    npm run build; \
    node_modules/.bin/tsc --declaration true --emitDeclarationOnly true --noemit false --outdir dist/types --newLine lf

refresh:
	cp -r ${foundrypf2eloc}/dist/types/* .
	cp -r ${foundrypf2eloc}/types/foundry types
	cp ${foundrypf2eloc}/static/lang/*.json .
	patch -p1 -i "type-additions.patch"
