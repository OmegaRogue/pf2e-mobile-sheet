// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default () => ({
	input: "src/module/pf2e-mobile-sheet.js",
	output: {
		dir: "dist/module",
		format: "es",
		sourcemap: true,
	},
	plugins: [nodeResolve(), json()],
});
