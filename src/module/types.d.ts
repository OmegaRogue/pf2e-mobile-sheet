import { id as MODULE_ID } from "../../static/module.json";
import { HookParameters } from "../../types/types/foundry/client/core/hooks.js";

declare global {
	type HookParamsWindowManagerInit = HookParameters<"WindowManager:Init", never>;
	type HookParamsWindowManagerNewRendered = HookParameters<"WindowManager:NewRendered", [number]>;
	type HookParamsWindowManagerAdded = HookParameters<"WindowManager:Added", [number]>;
	type HookParamsWindowManagerRemoved = HookParameters<"WindowManager:Removed", [number]>;
	type HookParamsWindowManagerBroughtToTop = HookParameters<"WindowManager:BroughtToTop", [number]>;
	type HookParamsWindowManagerMinimized = HookParameters<"WindowManager:Minimized", [number]>;
	type HookParamsWindowManagerMaximized = HookParameters<"WindowManager:Maximized", [number]>;
	type HookParamsWindowManagerNoneVisible = HookParameters<"WindowManager:NoneVisible", never>;

	class Hooks {
		/**
		 * Register a callback handler which should be triggered when a hook is triggered.
		 *
		 * @param hook The unique name of the hooked event
		 * @param fn   The callback function which should be triggered when the hook event occurs
		 */
		static on(...args: HookParamsWindowManagerInit): number;
		static on(...args: HookParamsWindowManagerNewRendered): number;
		static on(...args: HookParamsWindowManagerAdded): number;
		static on(...args: HookParamsWindowManagerRemoved): number;
		static on(...args: HookParamsWindowManagerBroughtToTop): number;
		static on(...args: HookParamsWindowManagerMinimized): number;
		static on(...args: HookParamsWindowManagerMaximized): number;
		static on(...args: HookParamsWindowManagerNoneVisible): number;
		/**
		 * Register a callback handler for an event which is only triggered once the first time the event occurs.
		 * After a "once" hook is triggered the hook is automatically removed.
		 *
		 * @param hook  The unique name of the hooked event
		 * @param fn    The callback function which should be triggered when the hook event occurs
		 */
		static once(...args: HookParamsWindowManagerInit): number;
		static once(...args: HookParamsWindowManagerNewRendered): number;
		static once(...args: HookParamsWindowManagerAdded): number;
		static once(...args: HookParamsWindowManagerRemoved): number;
		static once(...args: HookParamsWindowManagerBroughtToTop): number;
		static once(...args: HookParamsWindowManagerMinimized): number;
		static once(...args: HookParamsWindowManagerMaximized): number;
		static once(...args: HookParamsWindowManagerNoneVisible): number;
	}

	interface Window {
		WindowManager: any;
	}

	interface ClientSettings {
		get(module: MODULE_ID, setting: "mobile-layout"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "mobile-windows"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "send-button"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "header-button-text"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "show-player-list"): boolean;

		// get(module: MODULE_ID, setting: "share-targets"): boolean;

		// get(module: MODULE_ID, setting: "receive-targets"): boolean;

		get(module: MODULE_ID, setting: "disable-canvas"): boolean;

		set(module: MODULE_ID, key: "disable-canvas", value: boolean): Promise<boolean>;

		set(module: MODULE_ID, key: "show-player-list", value: boolean): Promise<boolean>;
	}

	interface SocketlibSocket {
		executeAsGM(handler: "distance", sourceId: string, targetId: string): Promise<number>;

		executeAsGM(handler: "checkTargets", userId: string, tokenId: string): Promise<boolean>;

		executeAsGM(
			handler: "targetToken",
			tokenDocumentId: string,
			userSourceId: string,
			releaseOthers: boolean,
		): Promise<void>;

		executeAsGM(handler: "pingToken", tokenDocumentId: string): Promise<boolean>;

		executeAsGM(handler: "getTargets", userId: string): Promise<Set<string> | undefined>;

		executeAsGM(
			handler: "setTarget",
			tokenId: string,
			userId: string,
			targeted?: boolean,
			releaseOthers?: boolean,
			groupSelection?: boolea,
		): Promise<void>;
	}
}
