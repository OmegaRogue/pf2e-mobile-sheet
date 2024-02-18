import { Config } from "stylelint";

export default <Config>{
	extends: "stylelint-config-standard-scss",
	rules: {
		"scss/double-slash-comment-empty-line-before": false,
		"selector-class-pattern": null,
		"selector-id-pattern": null,
		"no-descending-specificity": null,
		"selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["export", "share"] }],
		"selector-type-no-unknown": [true, { ignore: ["default-namespace"] }],
		"property-no-unknown": [true, { ignoreSelectors: [":export", ":share"] }],
	},
};
