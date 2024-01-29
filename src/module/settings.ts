import { id as MODULE_ID } from "../../static/module.json";
import { setBodyData, toggleRender } from "./utils.js";

export function registerSettings() {
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
	game.settings.register(MODULE_ID, "header-button-text", {
		name: `${MODULE_ID}.settings.header-button-text.name`,
		hint: `${MODULE_ID}.settings.header-button-text.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: false,
		onChange: (value) => setBodyData("force-hide-header-button-text", value),
	});
	game.settings.register(MODULE_ID, "mobile-layout", {
		name: `${MODULE_ID}.settings.mobile-layout.name`,
		hint: `${MODULE_ID}.settings.mobile-layout.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: false,
		onChange: (value) => setBodyData("force-mobile-layout", value),
	});
	game.settings.register(MODULE_ID, "mobile-windows", {
		name: `${MODULE_ID}.settings.mobile-windows.name`,
		hint: `${MODULE_ID}.settings.mobile-windows.hint`,
		config: true,
		scope: "client",
		type: String,
		choices: {
			off: `${MODULE_ID}.settings.toggle.off`,
			on: `${MODULE_ID}.settings.toggle.on`,
			auto: `${MODULE_ID}.settings.toggle.auto`,
		},
		default: "auto",
		requiresReload: false,
		onChange: (value) => {
			setBodyData("force-mobile-window", value);
			for (const win of $(".window-app:not(#fsc-ng)")) {
				const width = Number.parseInt($(win).css("width").slice(0, -2));
				$(win).css("width", `${width - 1}px`);
				setTimeout(() => $(win).css("width", `${width}px`), 10);
			}
		},
	});
	game.settings.register(MODULE_ID, "disable-canvas", {
		name: `${MODULE_ID}.settings.disable-canvas.name`,
		hint: `${MODULE_ID}.settings.disable-canvas.hint`,
		config: true,
		scope: "client",
		type: Boolean,
		default: false,
		requiresReload: false,
		onChange: (value: boolean) => {
			toggleRender(!value);
		},
	});
	game.settings.register(MODULE_ID, "show-player-list", {
		name: `${MODULE_ID}.settings.show-player-list.name`,
		hint: `${MODULE_ID}.settings.show-player-list.hint`,
		config: false,
		scope: "client",
		type: Boolean,
		default: false,
		requiresReload: false,
		onChange: (value: boolean) => {
			setBodyData("hide-player-list", value);
		},
	});
}
