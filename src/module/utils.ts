export const MODULE_ID = "pf2e-mobile-sheet";

export function getDebug(): boolean | LogLevel {
	// const devMode: DevModeModule | undefined = game.modules.get("_dev-mode") as DevModeModule | undefined;
	return (game.modules.get("_dev-mode") as DevModeModule | undefined)?.api?.getPackageDebugValue(MODULE_ID) ?? false;
}

export function log(force: boolean, ...args: any[]): void {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.log(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function warn(force: boolean, ...args: any[]): void {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.warn(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function error(force: boolean, ...args: any[]): void {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.error(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function info(force: boolean, ...args: any[]): void {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.info(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function debug(force: boolean, ...args: any[]): void {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.debug(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

export function checkMobile(): boolean {
	switch (game.settings.get(MODULE_ID, "mobile-layout")) {
		case "off":
			return false;
		case "on":
			return true;
		case "auto":
		default:
			return window.screen.width < 930;
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

export function setBodyData(tag: string, value: any): void {
	const body = $("body");
	const fullTag = "data-mobile-" + tag;
	switch (value) {
		case "off":
			body.attr(fullTag, "false");
			break;
		case "on":
			body.attr(fullTag, "true");
			break;
		case "auto":
			body.removeAttr(fullTag);
			break;
		case "":
			body.removeAttr(fullTag);
			break;
		case "toggle":
			switch (body.attr(fullTag)) {
				case "true":
					body.attr(fullTag, "false");
					break;
				default:
				case "false":
					body.attr(fullTag, "true");
					break;
			}
			break;
		default:
			body.attr(fullTag, value.toString());
	}
}

export function getBodyData(tag: string): boolean | string | undefined {
	const body = $("body");
	const fullTag = "data-mobile-" + tag;
	const value = body.attr(fullTag);
	switch (value) {
		case "true":
			return true;
		case "false":
			return false;
		default:
			return value;
	}
}

export function toggleRender(value: boolean): void {
	if (value) canvas.ready && canvas.app.start();
	else canvas.ready && canvas.app.stop();
}
