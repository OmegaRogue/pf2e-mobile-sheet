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

export function warn(force: boolean, ...args: any[]) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.warn(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function error(force: boolean, ...args: any[]) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.error(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function info(force: boolean, ...args: any[]) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.info(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function debug(force: boolean, ...args: any[]) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.debug(MODULE_ID, "|", ...args);
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

export function setBodyData(tag: string, value: "on" | "off" | "auto") {
	const body = $("body");
	switch (value) {
		case "off":
			body.attr("data-" + tag, "false");
			break;
		case "on":
			body.attr("data-" + tag, "true");
			break;
		case "auto":
			body.removeAttr("data-" + tag);
			break;
	}
}

export function toggleRender(value: boolean) {
	if (value) canvas.ready && canvas.app.start();
	else canvas.ready && canvas.app.stop();
}
