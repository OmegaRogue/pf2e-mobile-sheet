
.PHONY: clean gen default

default: clean gen

clean:
	rm -rf ./{build,foundry,src,tests,types,vite.config.d.ts,*.json}

gen:
	cd ${foundrypf2eloc} && npm run clean && npm ci && npm run build && node_modules/.bin/tsc --declaration true --emitDeclarationOnly true --noemit false --outdir dist/types --newLine lf
	cp -r ${foundrypf2eloc}/dist/types/* .
	cp -r ${foundrypf2eloc}/types/foundry types
	cp ${foundrypf2eloc}/static/lang/*.json .
	patch -p1 -i "type-additions.patch"
