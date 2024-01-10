import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { id as MODULE_ID } from "../../static/module.json";
import * as math from "@pixi/math";
import type { EncounterTrackerPF2e } from "@module/apps/sidebar/index.ts";
import { CombatantPF2e } from "@module/encounter/combatant.js";
import { EncounterPF2e } from "@module/encounter/document.js";
import { TokenDocumentPF2e } from "@scene/token-document/document.js";
import { ScenePF2e } from "@scene/document.js";
import { checkMobile, checkMobileWithOverride, getDebug, log } from "./utils.js";

Hooks.once("devModeReady", async ({ registerPackageDebugFlag }) => {
	await registerPackageDebugFlag(MODULE_ID);
	getDebug();
});

// Initialize module
Hooks.once("init", async () => {
	log(true, "pf2e-mobile-sheet | Initializing pf2e-mobile-sheet");
	// Assign custom classes and constants here

	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

Hooks.once("ready", async () => {
	const collapse = $("#sidebar > nav#sidebar-tabs > a.collapse").clone();
	collapse.addClass("collapse-mobile");
	const collapseButton = collapse.find("i");
	collapse.on("click", () => {
		$("#sidebar > nav#sidebar-tabs > a.collapse:not(.collapse-mobile)")[0].click();
		setTimeout(() => {
			collapseButton.removeClass("fa-caret-left");
		}, 450);
	});
	collapseButton.removeClass("fa-caret-left");
	collapseButton.removeClass("fa-caret-right");
	collapseButton.addClass("fa-bars");
	collapse.prependTo($("#sidebar-tabs"));

	if (!checkMobile()) return;
	const body = $("body");
	if (game.modules.get("pathfinder-ui")?.active) body.addClass("pf2e-ui");
	if (game.modules.get("_chatcommands")?.active) body.addClass("chatcommander-active");
	// $(".taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar").remove();
	// $("tokenbar").remove();
	// $("canvas#board").remove();
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
	log(false, "Add Send Button");
});

async function dragEndFullscreenWindow() {
	if (!checkMobile()) return;
	const wind = $(".fullscreen-window");
	wind.css("width", "");
	wind.css("height", "");
	wind.css("top", "");
	wind.css("left", "");
}

$(window).on("resize", dragEndFullscreenWindow);

const characterSheetResizeObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		if (!entry.target.id.startsWith("CharacterSheetPF2e")) continue;
		const html = $(entry.target);
		if (entry.contentRect.width < 745 && !entries[0].target.classList.contains("mobile")) {
			log(false, "sidebar found", html.find("aside").length);
			if (html.find(".sheet-navigation #sidebar-tab").length === 0) {
				const sidebarTabButton = $(
					`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
						"pf2e-mobile-sheet.sidebar-tab",
					)}"><i class="fa-solid fa-bars"></i></a>`,
				);
				const afterButton = html.find(".sheet-navigation .panel-title");
				sidebarTabButton.insertAfter(afterButton);
			}

			const aside = html.find("aside");

			if (html.find(".sheet-content .tab.sidebar").length === 0) {
				const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
				sidebarTab.append(aside.detach());
				html.find(".sheet-content").append(sidebarTab);
			} else {
				html.find(".sheet-content .tab.sidebar").append(aside.detach());
			}

			entries[0].target.classList.add("mobile");
			log(false, "mobile", entry);
			log(false, "sidebar found", html.find("aside").length);
		} else if (entry.contentRect.width >= 745 && entries[0].target.classList.contains("mobile")) {
			log(false, "sidebar found off", html.find("aside").length);
			entries[0].target.classList.remove("mobile");
			const sidebar = html.find(".tab.sidebar aside");
			html.find(".window-content form").prepend(sidebar.detach());
			const sidebarTab = html.find(".tab.sidebar.active");
			if (sidebarTab.length > 0) {
				sidebarTab.removeClass("active");
				html.find('a[data-tab="character"]')[0].click();
			}
			log(false, "no mobile");
			log(false, "sidebar found", html.find("aside").length);
		}
	}
});

const vehicleSheetResizeObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		if (!entry.target.id.startsWith("VehicleSheetPF2e")) continue;
		const html = $(entry.target);
		if (entry.contentRect.width < 585 && !entries[0].target.classList.contains("mobile")) {
			log(true, "sidebar found", html.find("aside").length);
			if (html.find(".sheet-navigation #sidebar-tab").length === 0) {
				const sidebarTabButton = $(
					`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
						"pf2e-mobile-sheet.sidebar-tab",
					)}"><i class="fa-solid fa-bars"></i></a>`,
				);
				const afterButton = html.find(".sheet-navigation .panel-title");
				sidebarTabButton.insertAfter(afterButton);
			}

			const aside = html.find("aside");

			if (html.find(".sheet-content .tab.sidebar").length === 0) {
				const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
				sidebarTab.append(aside.detach());
				html.find(".sheet-content").append(sidebarTab);
			} else {
				html.find(".sheet-content .tab.sidebar").append(aside.detach());
			}

			entries[0].target.classList.add("mobile");
			log(true, "mobile", entry);
			log(true, "sidebar found", html.find("aside").length);
		} else if (entry.contentRect.width >= 585 && entries[0].target.classList.contains("mobile")) {
			log(true, "sidebar found off", html.find("aside").length);
			entries[0].target.classList.remove("mobile");
			const sidebar = html.find(".tab.sidebar aside");
			html.find(".window-content form").prepend(sidebar.detach());
			const sidebarTab = html.find(".tab.sidebar.active");
			if (sidebarTab.length > 0) {
				sidebarTab.removeClass("active");
				html.find('a[data-tab="details"]')[0].click();
			}
			log(true, "no mobile");
			log(true, "sidebar found", html.find("aside").length);
		}
	}
});

Hooks.on("closeCharacterSheetPF2e", (_app: Application, html: JQuery) => {
	characterSheetResizeObserver.unobserve(html[0]);
});
Hooks.on("closeVehicleSheetPF2e", (_app: Application, html: JQuery) => {
	vehicleSheetResizeObserver.unobserve(html[0]);
});

async function renderFullscreenWindow(_app: Application, html: JQuery): Promise<void> {
	if (checkMobileWithOverride("close-button-text")) {
		const closeButton = html.find(".header-button.control.close");
		closeButton
			.contents()
			.filter(function () {
				return this.nodeType === 3;
			})
			.last()
			.replaceWith("");
	}
	if (!checkMobile()) return;
	if (!html.hasClass("window-app") || html.hasClass("dialog")) {
		return;
	}
	html.addClass("fullscreen-window");
	html.removeClass("");
	html.css("width", "");
	html.css("height", "");
	html.css("top", "");
	html.css("left", "");
	const header = html.find("header") as JQuery<HTMLElement>;
	header.removeClass("draggable");
	header.removeClass("resizable");
}

// document.querySelector("#combat-tracker > li.combatant.actor.directory-item.flexrow.hidden-name.gm-draggable > div.token-name.flexcol > h4 > span.name")

Hooks.on("renderActorSheet", renderFullscreenWindow);
Hooks.on("renderApplication", renderFullscreenWindow);
Hooks.on("dragEndActorSheet", dragEndFullscreenWindow);
Hooks.on("dragEndApplication", dragEndFullscreenWindow);
Hooks.on("setAppScaleEvent", dragEndFullscreenWindow);

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
	if (tab.appId !== 24) return;
	await updateCombatTracker((tab as EncounterTrackerPF2e<EncounterPF2e>).viewed?.turns);
});

Hooks.on("refreshToken", async () => {
	if (!game.combat?.turns) return;
	await updateCombatTracker(game.combat?.turns);
});

Hooks.on("renderSettingsConfig", (_app: Application, html: JQuery) => {
	if (!checkMobile()) return;
	const content = html.find("div:not(#mps-view-group).flexrow");
	if (content.length === 1) {
		content.removeClass("flexrow");
		content.addClass("flexcol");
	}
	const scrollable = html.find(".scrollable");
	scrollable.appendTo(content);
	const form = html.find(".categories");
	scrollable.children().appendTo(form);
	const sidebar = html.find("aside.sidebar");
	sidebar.appendTo(scrollable);
	form.appendTo(scrollable);
	const footer = form.find("footer");
	if (footer.length === 1) {
		html.find(".reset-all").prependTo(footer);
		footer.addClass("flexrow");
		footer.appendTo(content);
		const submitButton = footer.find("button[type=submit]");
		submitButton.removeAttr("type").attr("type", "button");
		submitButton.on("click", () => form.trigger("submit"));
	}
});

Hooks.on("renderCharacterSheetPF2e", (_app: Application, html: JQuery) => {
	html = html.closest(".app");
	characterSheetResizeObserver.observe(html[0]);
	if (html.hasClass("mobile")) {
		if (html.find(".sheet-navigation #sidebar-tab").length === 0) {
			const sidebarTabButton = $(
				`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
					"pf2e-mobile-sheet.sidebar-tab",
				)}"><i class="fa-solid fa-bars"></i></a>`,
			);
			const afterButton = html.find(".sheet-navigation .panel-title");
			sidebarTabButton.insertAfter(afterButton);
		}

		const aside = html.find("aside");

		if (html.find(".sheet-content .tab.sidebar").length === 0) {
			const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
			sidebarTab.append(aside.detach());
			html.find(".sheet-content").append(sidebarTab);
		} else {
			html.find(".sheet-content .tab.sidebar").append(aside.detach());
		}
	}
});

Hooks.on("renderVehicleSheetPF2e", (_app: Application, html: JQuery) => {
	html = html.closest(".app");
	vehicleSheetResizeObserver.observe(html[0]);
	if (html.hasClass("mobile")) {
		if (html.find(".sheet-navigation #sidebar-tab").length === 0) {
			const sidebarTabButton = $(
				`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
					"pf2e-mobile-sheet.sidebar-tab",
				)}"><i class="fa-solid fa-bars"></i></a>`,
			);
			const afterButton = html.find(".sheet-navigation .panel-title");
			sidebarTabButton.insertAfter(afterButton);
		}

		const aside = html.find("aside");

		if (html.find(".sheet-content .tab.sidebar").length === 0) {
			const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
			sidebarTab.append(aside.detach());
			html.find(".sheet-content").append(sidebarTab);
		} else {
			html.find(".sheet-content .tab.sidebar").append(aside.detach());
		}
	}
});

Hooks.on("collapseSidebar", (_, collapsed: boolean) => {
	if (!checkMobile()) return;
	const sidebar = $("#sidebar");
	const collapseButton = sidebar.find(".collapse > i");
	if (collapsed) {
		collapseButton.removeClass("fa-caret-left");
		// collapseButton.addClass('fa-caret-left');
	} else {
		collapseButton.removeClass("fa-caret-right");
		// collapseButton.addClass('fa-caret-left');
	}
});
