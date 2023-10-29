import { id as MODULE_ID } from "../../static/module.json";
import { socket } from "./pf2e-mobile-sheet.js";

declare global {
	interface ClientSettings {
		get(module: MODULE_ID, setting: "mobile-mode"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "send-button"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "close-button-text"): "on" | "off" | "auto";

		get(module: MODULE_ID, setting: "share-targets"): boolean;
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
