import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs-extra";
import checker from "vite-plugin-checker";

const EN_JSON = JSON.parse(fs.readFileSync("./static/lang/en.json", { encoding: "utf-8" }));
const plugins = [
	checker({ typescript: true }),
	tsconfigPaths(),
	...viteStaticCopy({
		targets: [{ src: "README.md", dest: "." }],
	}),
];

export default defineConfig({
	publicDir: "static",
	define: {
		EN_JSON: JSON.stringify(EN_JSON),
		fu: "foundry.utils",
	},
	esbuild: { keepNames: true },
	build: {
		emptyOutDir: false,
		outDir: "dist",
		minify: true,
		sourcemap: true,
		lib: {
			name: "pf2e-mobile-sheet",
			entry: "src/module/mobile-sheet.ts",
			formats: ["es"],
			fileName: "pf2e-mobile-sheet",
		},
		rollupOptions: {
			watch: { buildDelay: 100 },
		},
		target: "ESNext",
	},
	server: {
		port: 30001,
		open: "/game",
		proxy: {
			"^(?!/modules/pf2e-mobile-sheet/)": "http://localhost:30000/",
			"/socket.io": {
				target: "ws://localhost:30000",
				ws: true,
				secure: false,
				changeOrigin: true,
			},
		},
	},
	plugins,
});
