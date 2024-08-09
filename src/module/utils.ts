// import { FederatedEvent, FederatedEventTarget, FederatedPointerEvent, PixiTouch } from "pixi.js";
import { MODULE_ID as MODULE_ID_TYPE } from "./types.js";
import { IPoint } from "@pixi/math";

export const MODULE_ID: MODULE_ID_TYPE = "mobile-sheet";

export function getDebug(): boolean | LogLevel {
	// const devMode: DevModeModule | undefined = game.modules.get("_dev-mode") as DevModeModule | undefined;
	return (game.modules.get("_dev-mode") as DevModeModule | undefined)?.api?.getPackageDebugValue(MODULE_ID) ?? true;
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

export async function joystickPreview(pos: IPoint, type: MeasuredTemplateType, data: Record<string, unknown>) {
	const dataA: DeepPartial<foundry.documents.MeasuredTemplateSource> = {
		t: type,
		distance: 10,
		width: CONFIG.MeasuredTemplate.defaults.width * (canvas.dimensions?.distance ?? 1),
		fillColor: game.user.color,
		...data,
		...pos,
	};
	// @ts-ignore
	await canvas.templates._createPreview(dataA, { renderSheet: false });
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

// export function isPixiTouch(obj: MouseEvent | PointerEvent | PixiTouch): obj is PixiTouch {
// 	return "tangentialPressure" in obj;
// }
//
// export function isPlaceableObject(obj: FederatedEventTarget): obj is PlaceableObject {
// 	return obj instanceof PlaceableObject;
// }
//
// // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
// export function viewHeight(): void {
// 	document.documentElement.style.setProperty("--vh", `${Math.min(window.innerHeight, window.outerHeight) * 0.01}px`);
// }
//
// export function isFederatedPointerEvent(_obj: FederatedEvent | Event): _obj is FederatedPointerEvent {
// 	// return "button" in obj;
// 	return true;
// }
