import { id as MODULE_ID } from "../../static/module.json";


declare global {
	interface ClientSettings {
		get(module: MODULE_ID, setting: "mobile-mode"): "on" | "off" | "auto";
		get(module: MODULE_ID, setting: "send-button"): "on" | "off" | "auto";
		get(module: MODULE_ID, setting: "close-button-text"): "on" | "off" | "auto";
	}
}
