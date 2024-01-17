import { DevModeModule, LogLevel } from "./devMode.js";
import { id as MODULE_ID } from "../../static/module.json";

export function getDebug(): boolean | LogLevel {
	// const devMode: DevModeModule | undefined = game.modules.get("_dev-mode") as DevModeModule | undefined;
	return (game.modules.get("_dev-mode") as DevModeModule | undefined)?.api?.getPackageDebugValue(MODULE_ID) ?? false;
}

export function log(force: boolean, ...args: any[]) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.log(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

const isMobile = window.screen.width < 930;

export function checkMobile(): boolean {
	if (getDebug()) {
		return false;
	}
	switch (game.settings.get(MODULE_ID, "mobile-mode")) {
		case "off":
			return false;
		case "on":
			return true;
		case "auto":
		default:
			return isMobile;
	}
}

export function checkMobileWithOverride(settingId: "send-button" | "header-button-text"): boolean {
	switch (game.settings.get(MODULE_ID, settingId)) {
		case "on":
			return true;
		case "off":
			return false;
		case "auto":
		default:
			return checkMobile();
	}
}
