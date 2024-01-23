import { mergeObject } from "types/types/foundry/common/utils/helpers.js";
import { id as MODULE_ID } from "../../static/module.json";
import { setBodyData } from "./utils.js";
import { ShareTargetSettingsOptions } from "src/types/settings.ts";
import { PartialSettingsData } from "@module/system/settings/menu.js";

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
		onChange: (value) => setBodyData("mobile-force-hide-header-button-text", value),
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
		onChange: (value) => setBodyData("mobile-force-mobile-layout", value),
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
			setBodyData("mobile-force-mobile-window", value);
			for (const win of $(".window-app:not(#fsc-ng)")) {
				const width = Number.parseInt($(win).css("width").slice(0, -2));
				$(win).css("width", `${width - 1}px`);
				setTimeout(() => $(win).css("width", `${width}px`), 10);
			}
		},
	});

	game.settings.registerMenu(MODULE_ID, "mobile-share-targets-settings", {
		name: `${MODULE_ID}.settings.mobile-share-targets.name`,
		hint: `${MODULE_ID}.settings.mobile-share-targets.hint`,
		label: `${MODULE_ID}.settings.mobile-share-targets.name`,
		type: EnableShareRecieveTargets,
		restricted: true,
		icon: "fas fa-bullseye",
	});
	game.settings.register(MODULE_ID, "mobile-share-targets", {
		name: `${MODULE_ID}.settings.mobile-share-targets.name`,
		hint: `${MODULE_ID}.settings.mobile-share-targets.hint`,
		scope: "world",
		config: false,
		type: Object,
		default: {},
		requiresReload: true,
	});
}
export class EnableShareRecieveTargets extends FormApplication {
	static readonly namespace: string;

	/**
	 * Default Options for this FormApplication
	 */
	static override get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "enableShareRecieveTargets",
			title: "Mobile Share Targets",
			template: "./modules/LockView/templates/enableShareRecieveTargets.html",
		});
	}

	get namespace(): string {
		return (this.constructor as typeof EnableShareRecieveTargets).namespace;
	}

	/** Settings to be registered and also later referenced during user updates */
	protected static get settings(): Record<string, PartialSettingsData> {
		return {};
	}

	/**
	 * Provide data to the template
	 */
	override getData() {
		const users = game.users.players;
		const settings = game.settings.get(MODULE_ID, "mobile-share-targets") as Partial<ShareTargetSettingsOptions>[];
		const data = [] as Partial<FormApplicationOptions>[];

		for (let i = 0; i < users.length; i++) {
			const userData = users[i];
			let role;
			if (userData.role === 0) role = game.i18n.localize("USER.RoleNone");
			else if (userData.role === 1) role = game.i18n.localize("USER.RolePlayer");
			else if (userData.role === 2) role = game.i18n.localize("USER.RoleTrusted");
			else if (userData.role === 3) role = game.i18n.localize("USER.RoleAssistant");
			else if (userData.role === 4) role = game.i18n.localize("USER.RoleGamemaster");

			const userSettings = settings.filter((u) => u.id === userData._id)[0];

			const dataNew: ShareTargetSettingsOptions = {
				index: i,
				name: userData.name,
				role: role,
				color: userData.color,
				id: userData._id ? userData._id : undefined,
				send: userSettings?.send ? userSettings.send : false,
				recieve: userSettings?.recieve ? userSettings.recieve : false,
			};
			data.push(dataNew);
		}

		return {
			data,
		} as FormApplicationData<ShareTargetSettingsOptions>;
	}

	static registerSettings(): void {
		const settings = this.settings;
		for (const setting of Object.keys(settings)) {
			game.settings.register(MODULE_ID, setting, {
				...settings[setting],
				config: false,
			});
		}
	}

	protected override async _updateObject(_event: Event, data: Record<string, unknown>): Promise<void> {
		const settings = [] as Partial<ShareTargetSettingsOptions>[];
		let idArray = [data.id];
		if (!Array.isArray(idArray)) {
			idArray = [];
			idArray[0] = data.id;
		}
		for (const id of idArray) {
			const settingsNew = {
				id: id as string,
				send: data?.[`send-${id}`] as boolean,
				recieve: data?.[`recieve-${id}`] as boolean,
			};
			settings.push(settingsNew);
		}
		await game.settings.set(MODULE_ID, "mobile-share-targets-settings", settings);
	}
}
