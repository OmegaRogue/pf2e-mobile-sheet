import { id as MODULE_ID } from "../../static/module.json";

export function registerSettings() {
	game.settings.register(MODULE_ID, "mobile-mode", {
		name: `${MODULE_ID}.settings.mobile-mode.name`,
		hint: `${MODULE_ID}.settings.mobile-mode.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: true,
	});
	game.settings.register(MODULE_ID, "send-button", {
		name: `${MODULE_ID}.settings.send-button.name`,
		hint: `${MODULE_ID}.settings.send-button.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: true,
	});
	game.settings.register(MODULE_ID, "close-button-text", {
		name: `${MODULE_ID}.settings.close-button-text.name`,
		hint: `${MODULE_ID}.settings.close-button-text.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: true,
	});
	game.settings.register(MODULE_ID, "share-targets", {
		name: `${MODULE_ID}.settings.share-targets.name`,
		hint: `${MODULE_ID}.settings.share-targets.hint`,
		config: true,
		scope: "client",
		type: Boolean,
		default: false,
	});
	game.settings.register(MODULE_ID, "disable-canvas", {
		name: `${MODULE_ID}.settings.disable-canvas.name`,
		hint: `${MODULE_ID}.settings.disable-canvas.hint`,
		config: true,
		scope: "client",
		type: Boolean,
		default: false,
	});
}
