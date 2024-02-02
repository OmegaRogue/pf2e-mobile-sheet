import { ActorPF2e } from "@actor/index.js";
import { ItemPF2e } from "@item/index.js";
import { ScenePF2e } from "@scene/index.js";
import { MacroPF2e } from "@module/macro.js";
import { UserPF2e } from "@module/user/document.js";
import { EncounterPF2e } from "@module/encounter/document.js";
import { ChatMessagePF2e } from "@module/chat-message/document.js";
import { ActorsPF2e } from "@module/collection/actors.js";
import { WindowManager } from "./apps/windowManager.js";
import { MODULE_ID } from "./utils.js";
import "foundry-types";

export type ShareTargetSettings = {
	send: boolean;
	receive: boolean;
	id: string;
};
export type ShareTargetSettingsOptions = {} & Partial<FormApplicationOptions>;


declare global {
	interface GamePF2e
		extends Game<
			ActorPF2e<null>,
			ActorsPF2e<ActorPF2e<null>>,
			ChatMessagePF2e,
			EncounterPF2e,
			ItemPF2e<null>,
			MacroPF2e,
			ScenePF2e,
			UserPF2e
		> {
		mobilemode: MobileMode;
	}

	declare namespace Hooks {
		type HookParamsWindowManagerInit = HookParameters<"WindowManager:Init", never>;
		type HookParamsWindowManagerNewRendered = HookParameters<"WindowManager:NewRendered", [number]>;
		type HookParamsWindowManagerAdded = HookParameters<"WindowManager:Added", [number]>;
		type HookParamsWindowManagerRemoved = HookParameters<"WindowManager:Removed", [number]>;
		type HookParamsWindowManagerBroughtToTop = HookParameters<"WindowManager:BroughtToTop", [number]>;
		type HookParamsWindowManagerMinimized = HookParameters<"WindowManager:Minimized", [number]>;
		type HookParamsWindowManagerMaximized = HookParameters<"WindowManager:Maximized", [number]>;
		type HookParamsWindowManagerNoneVisible = HookParameters<"WindowManager:NoneVisible", never>;

		/**
		 * Register a callback handler which should be triggered when a hook is triggered.
		 *
		 * @param hook The unique name of the hooked event
		 * @param fn   The callback function which should be triggered when the hook event occurs
		 */
		function on(...args: HookParamsWindowManagerInit): number;
		function on(...args: HookParamsWindowManagerNewRendered): number;
		function on(...args: HookParamsWindowManagerAdded): number;
		function on(...args: HookParamsWindowManagerRemoved): number;
		function on(...args: HookParamsWindowManagerBroughtToTop): number;
		function on(...args: HookParamsWindowManagerMinimized): number;
		function on(...args: HookParamsWindowManagerMaximized): number;
		function on(...args: HookParamsWindowManagerNoneVisible): number;

		/**
		 * Register a callback handler for an event which is only triggered once the first time the event occurs.
		 * After a "once" hook is triggered the hook is automatically removed.
		 *
		 * @param hook  The unique name of the hooked event
		 * @param fn    The callback function which should be triggered when the hook event occurs
		 */
		function once(...args: HookParamsWindowManagerInit): number;
		function once(...args: HookParamsWindowManagerNewRendered): number;
		function once(...args: HookParamsWindowManagerAdded): number;
		function once(...args: HookParamsWindowManagerRemoved): number;
		function once(...args: HookParamsWindowManagerBroughtToTop): number;
		function once(...args: HookParamsWindowManagerMinimized): number;
		function once(...args: HookParamsWindowManagerMaximized): number;
		function once(...args: HookParamsWindowManagerNoneVisible): number;
	}

	interface Window {
		WindowManager: WindowManager;
	}

	interface ClientSettings {
		get(module: typeof MODULE_ID, setting: "mobile-layout"): "on" | "off" | "auto";

		get(module: typeof MODULE_ID, setting: "mobile-windows"): "on" | "off" | "auto";

		get(module: typeof MODULE_ID, setting: "send-button"): "on" | "off" | "auto";

		get(module: typeof MODULE_ID, setting: "header-button-text"): "on" | "off" | "auto";
    
    get(module: typeof MODULE_ID, setting: "mobile-share-targets"): ShareTargetSettings[];
    
    get(module: typeof MODULE_ID, setting: "show-player-list"): boolean;

		get(module: typeof MODULE_ID, setting: "disable-canvas"): boolean;

		set(module: typeof MODULE_ID, key: "disable-canvas", value: boolean): Promise<boolean>;

		set(module: typeof MODULE_ID, key: "show-player-list", value: boolean): Promise<boolean>;
    
    set(module: typeof MODULE_ID, key: "mobile-layout", value: "on" | "off" | "auto"): Promise<"on" | "off" | "auto">;

		set(module: typeof MODULE_ID, key: "mobile-windows", value: "on" | "off" | "auto"): Promise<"on" | "off" | "auto">;

		set(module: typeof MODULE_ID, key: "send-button", value: "on" | "off" | "auto"): Promise<"on" | "off" | "auto">;

		set(module: typeof MODULE_ID, key: "header-button-text", value: "on" | "off" | "auto"): Promise<"on" | "off" | "auto">;

		set(
			module: typeof MODULE_ID,
			key: "mobile-share-targets",
			value: ShareTargetSettings[],
		): Promise<ShareTargetSettings[]>;

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
			groupSelection?: boolean,
		): Promise<void>;
	}
}
