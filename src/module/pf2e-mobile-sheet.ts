import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { id as MODULE_ID } from "../../static/module.json";
import * as math from "@pixi/math";
import type { EncounterTrackerPF2e } from "@module/apps/sidebar/index.ts";
import { CombatantPF2e } from "@module/encounter/combatant.js";
import { EncounterPF2e } from "@module/encounter/document.js";
import { TokenDocumentPF2e } from "@scene/token-document/document.js";
import { ScenePF2e } from "@scene/document.js";
import { checkMobile, debug, getDebug, info, setBodyData } from "./utils.js";
import * as windowMgr from "./apps/windowManager.js";

import "styles/pf2e-mobile-sheet.scss";
import "./resizeObservers.js";
import { MobileUI } from "./apps/MobileUI.js";

abstract class MobileMode {
	static enabled = false;
	static navigation: MobileUI;

	static enter() {
		if (MobileMode.enabled) return;
		MobileMode.enabled = true;
		document.body.classList.add("mobile-improvements");
		// ui.nav?.collapse();
		// viewHeight();
		Hooks.call("mobile-improvements:enter");
	}

	static leave() {
		if (!MobileMode.enabled) return;
		MobileMode.enabled = false;
		document.body.classList.remove("mobile-improvements");
		Hooks.call("mobile-improvements:leave");
	}

	static viewResize() {
		// if (MobileMode.enabled) viewHeight();
		// if (game.settings && getSetting(settings.PIN_MOBILE_MODE))
		// 	return MobileMode.enter();
		// if (localStorage.getItem("mobile-improvements.pinMobileMode") === "true")
		// 	return MobileMode.enter();
		// if (window.innerWidth <= 800) {
		// 	MobileMode.enter();
		// } else {
		// 	MobileMode.leave();
		// }
	}
}

Hooks.once("devModeReady", async ({ registerPackageDebugFlag }) => {
	await registerPackageDebugFlag(MODULE_ID);
	getDebug();
});

// Initialize module
Hooks.once("init", async () => {
	info(true, "Initializing " + MODULE_ID);
	// Assign custom classes and constants here
	windowMgr.activate();

	if (MobileMode.navigation === undefined) {
		MobileMode.navigation = new MobileUI();
	}
	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

Hooks.once("ready", async () => {
	if (!game.modules.get("lib-wrapper")?.active && game.user.isGM)
		ui.notifications.error(
			"Module Pf2e Mobile Sheet requires the 'libWrapper' module. Please install and activate it.",
		);
	// @ts-ignore
	game.mobilemode = MobileUI;
	const collapse = $("#sidebar > nav#sidebar-tabs > a.collapse").clone();
	collapse.prop("id", "collapse-mobile");
	const collapseButton = collapse.find("i");
	collapse.on("click", () => {
		$("#sidebar > nav#sidebar-tabs > a.collapse:not(#collapse-mobile)")[0].click();
		setTimeout(() => {
			collapseButton.removeClass("fa-caret-left");
		}, 450);
	});
	collapseButton.removeClass("fa-caret-left");
	collapseButton.removeClass("fa-caret-right");
	collapseButton.addClass("fa-bars");
	collapse.prependTo($("#sidebar-tabs"));

	const body = $("body");

	setBodyData("mobile-force-hide-header-button-text", game.settings.get(MODULE_ID, "header-button-text"));
	setBodyData("mobile-force-mobile-window", game.settings.get(MODULE_ID, "mobile-windows"));
	setBodyData("mobile-force-mobile-layout", game.settings.get(MODULE_ID, "mobile-layout"));

	if (!checkMobile()) return;
	if (game.modules.get("pathfinder-ui")?.active) body.addClass("pf2e-ui");
	if (game.modules.get("_chatcommands")?.active) body.addClass("chatcommander-active");
	// $(".taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar").remove();
	// $("tokenbar").remove();
	// $("canvas#board").remove();
});

Hooks.on("renderApplication", async (app: Application) => {
	if (app.id !== "fsc-ng") return;
	setTimeout(() => {
		const simpleCalendarTaskbarButton = $(".taskbar-item:contains('Simple Calendar')");
		if (!simpleCalendarTaskbarButton.hasClass("taskbar-hidden-mobile")) {
			simpleCalendarTaskbarButton.addClass("taskbar-hidden-mobile");
		}
	}, 500);
});
Hooks.on("renderChatLog", async () => {
	// if (!checkMobileWithOverride("send-button")) return;
	const sendButton = $(`<button type="button" class="button send-button"><i class="fas fa-paper-plane"/></button>`);
	sendButton.on("click", () => {
		document?.querySelector("#chat-message")?.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				code: "Enter",
			}),
		);
	});
	if (game.modules.get("_chatcommands")?.active) {
		sendButton.appendTo("#chat-form");
	} else {
		const chatContainer = $(`<div id="mobile-chat-row" class="flexrow"></div>`);
		chatContainer.appendTo("#chat-form");
		$("#chat-message").appendTo(chatContainer);
		sendButton.appendTo(chatContainer);
	}
	debug(false, "Add Send Button");
});

// abstract class MobileMode {
// 	static navigation: MobileUI;
// }

// Hooks.on("targetToken", (user, token, targeted) => {
// 	game.settings.
// 	if (!game.settings.get(MODULE_ID, "share-targets")) return;
// 	if (user.id === sharedUserId) {
// 		for (const userId in sharingUsers) {
// 			socket.executeAsUser(socketTarget, userId, targeted, token.id);
// 		}
// 	} else {
// 		socket.executeAsUser(socketTarget, sharedUserId, targeted, token.id);
// 	}
// });

// document.querySelector("#combat-tracker > li.combatant.actor.directory-item.flexrow.hidden-name.gm-draggable > div.token-name.flexcol > h4 > span.name")

const headings = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

async function updateCombatTracker(
	combatants: CombatantPF2e<EncounterPF2e, TokenDocumentPF2e<ScenePF2e | null> | null>[],
) {
	const scene = game.scenes.active;
	if (!scene) return;
	const grid = scene.grid;
	if (!game.user.character) return;
	const origin = scene.tokens.find((t) => t.isOwner) || scene.tokens.get(game.user.character.id);
	if (!origin) return;
	for (const combatant of combatants) {
		let dist = 0;
		const target = scene.tokens.get(combatant.tokenId ?? "");
		if (!target) return;
		dist = canvas.grid.measureDistance(origin.center, target.center, { gridSpaces: true });
		const combatantDisplay = $(`#combat-tracker li[data-combatant-id=${combatant.id}]`);
		// let targetIndicator = combatantDisplay.find(".users-targeting");

		if (combatantDisplay.find(".distance").length === 0) {
			$(`<span class="distance"></span>`).insertAfter(combatantDisplay.find("h4 .name"));
		}
		const ray = new Ray(origin.center, target.center);
		const angle = ray.angle * math.RAD_TO_DEG;
		const headingAngle = Math.round(angle / (360 / headings.length) + 4);
		const heading = headings[((headingAngle % headings.length) + headings.length) % headings.length];
		combatantDisplay.find(".distance").text(`[${dist}${grid.units} ${heading}]`);
	}
}

Hooks.on("changeSidebarTab", async (tab: SidebarTab) => {
	if (tab.id !== "combat") return;
	await updateCombatTracker((tab as EncounterTrackerPF2e<EncounterPF2e>).viewed?.turns);
});

Hooks.on("refreshToken", async () => {
	if (!game.combat?.turns) return;
	await updateCombatTracker(game.combat?.turns);
});

Hooks.on("collapseSidebar", (_, collapsed: boolean) => {
	if (!checkMobile()) return;
	const sidebar = $("#sidebar");
	const collapseButton = sidebar.find(".collapse > i");
	if (collapsed) collapseButton.removeClass("fa-caret-left");
	else collapseButton.removeClass("fa-caret-right");
});

globalThis.MobileMode = MobileMode;
