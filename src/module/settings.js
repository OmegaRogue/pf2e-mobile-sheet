import { id as MODULE_ID } from "../module.json";

const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

export function registerSettings() {
	game.settings.register(MODULE_ID, "mobile-mode", {
		name: MODULE_ID + ".settings.mobile-mode.name",
		hint: MODULE_ID + ".settings.mobile-mode.hint",
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: MODULE_ID + ".settings.toggle.off",
			on: MODULE_ID + ".settings.toggle.on",
			auto: MODULE_ID + ".settings.toggle.auto",
		},
		default: "auto",
		onChange: debouncedReload,
	});
	game.settings.register(MODULE_ID, "send-button", {
		name: MODULE_ID + ".settings.send-button.name",
		hint: MODULE_ID + ".settings.send-button.hint",
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: MODULE_ID + ".settings.toggle.off",
			on: MODULE_ID + ".settings.toggle.on",
			auto: MODULE_ID + ".settings.toggle.auto",
		},
		default: "auto",
		onChange: debouncedReload,
	});
}
