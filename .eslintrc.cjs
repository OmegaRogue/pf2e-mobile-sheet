// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

module.exports = {
	parserOptions: {
		ecmaVersion: 2020,
		extraFileExtensions: [".cjs", ".mjs"],
		sourceType: "module",
	},

	env: {
		browser: true,
		jquery: true,
	},

	extends: ["eslint:recommended", "@typhonjs-fvtt/eslint-config-foundry.js/0.8.0", "plugin:prettier/recommended"],

	plugins: [],

	rules: {
		// Specify any specific ESLint rules.
		indent: ["error", "tab", { SwitchCase: 1 }],
	},

	overrides: [
		{
			files: ["./*.js", "./*.cjs", "./*.mjs"],
			env: {
				node: true,
			},
		},
	],
};
