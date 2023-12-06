import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { id as MODULE_ID } from "../../static/module.json";
import * as math from "@pixi/math";
import type { EncounterTrackerPF2e } from "@module/apps/sidebar/index.ts";
import { CombatantPF2e } from "@module/encounter/combatant.js";
import { EncounterPF2e } from "@module/encounter/document.js";
import { TokenDocumentPF2e } from "@scene/token-document/document.js";
import { ScenePF2e } from "@scene/document.js";
import { socket } from "./socketfuncs.ts";
import { checkMobile, checkMobileWithOverride, getDebug, log } from "./utils.js";
import "styles/pf2e-mobile-sheet.scss";

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
	if (!checkMobile()) return;
	const body = $("body");
	body.addClass("mobile-pf2e");
	if (game.modules.get("pathfinder-ui")?.active) body.addClass("pf2e-ui");
	if (game.modules.get("_chatcommands")?.active) body.addClass("chatcommander-active");
	$(".taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar").remove();
	$("#ui-bottom, tokenbar").remove();
	const collapseButton = $("#sidebar .collapse > i");
	collapseButton.removeClass("fa-caret-left");
	collapseButton.removeClass("fa-caret-right");
	collapseButton.addClass("fa-bars");
	$("#sidebar > nav#sidebar-tabs > a.collapse").prependTo($("#sidebar-tabs"));
});
Hooks.on("renderChatLog", async () => {
	if (!checkMobileWithOverride("send-button")) return;
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

			html.find(".proficiencies-list .skill-prof.button-group h6").text(
				game.i18n.localize(`pf2e-mobile-sheet.ModifiersTitleShort`),
			);
			for (let i = 0; i < 5; i++) {
				html.find(`.skill-proficiency.pf-rank option[value=${i}]`).text(
					game.i18n.localize(`pf2e-mobile-sheet.ProficiencyLevel${i}Short`),
				);
			}
			log(false, "mobile");
			log(false, "sidebar found", html.find("aside").length);
		} else if (entry.contentRect.width >= 800 && entries[0].target.classList.contains("mobile")) {
			log(false, "sidebar found", html.find("aside").length);
			entries[0].target.classList.remove("mobile");
			html.find(".window-content form").prepend(html.find(".tab.sidebar aside").detach());
			const sidebarTab = html.find(".tab.sidebar.active");
			if (sidebarTab.length > 0) {
				sidebarTab.removeClass("active");
				html.find('a[data-tab="character"]')[0].click();
			}
			html.find(".proficiencies-list .skill-prof.button-group h6").text(
				game.i18n.localize(`PF2E.ModifiersTitle`),
			);
			for (let i = 0; i < 5; i++) {
				html.find(`.skill-proficiency.pf-rank option[value=${i}]`).text(
					game.i18n.localize(`PF2E.ProficiencyLevel${i}`),
				);
			}
			// const combatRanks = html.find(".combat-list select").children();
			// for (let i = 0; i < 5; i++)
			// 	combatRanks.eq(0).text(game.i18n.localize(`PF2E.ProficiencyLevel${i}Short`));

			log(false, "no mobile");
			log(false, "sidebar found", html.find("aside").length);
		}
	}
});

Hooks.on("closeCharacterSheetPF2e", (_app: Application, html: JQuery) => {
	characterSheetResizeObserver.unobserve(html[0]);
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
		let isTargeted = false;
		const target = scene.tokens.get(combatant.tokenId ?? "");
		if (!target) return;
		if (canvas.grid !== undefined) {
			dist = canvas.grid.measureDistance(origin.center, target.center, { gridSpaces: true });
			isTargeted = game.user.targets.find((t) => t.id === target.id) !== undefined;
		} else {
			dist = await socket.executeAsGM("distance", origin.id, target.id);
			isTargeted = await socket.executeAsGM("checkTargets", game.user.id, origin.id);
		}
		const combatantDisplay = $(`#combat-tracker li[data-combatant-id=${combatant.id}]`);
		const controls = combatantDisplay.find(".combatant-controls");
		// let targetIndicator = combatantDisplay.find(".users-targeting");
		if (controls.find("[data-control=toggleTarget]").length === 0) {
			const targetButton = $(
				`<a class="combatant-control" data-control="toggleTarget" data-tooltip="COMBAT.ToggleTargeting" aria-describedby="tooltip"><i class="fa-duotone fa-location-crosshairs fa-fw"></i></a>`,
			);
			targetButton.on("click", async () => {
				await socket.executeAsGM("targetToken", target.id, game.user.id, false);
				isTargeted = !isTargeted;
				if (isTargeted) {
					targetButton.addClass("active");
					// $(
					// 	`<i class="fa-duotone fa-location-crosshairs fa-fw" style="color: ${game.user.color};"></i>`,
					// ).appendTo(targetIndicator);
				} else {
					targetButton.removeClass("active");
					// targetIndicator.children().remove();
				}
			});
			targetButton.insertBefore(controls.find(".token-effects"));
		}
		if (controls.find("[data-control=pingCombatant]").length === 0) {
			const pingButton = $(
				`<a class="combatant-control" aria-label="${game.i18n.localize(
					"COMBAT.PingCombatant",
				)}" role="button" data-tooltip="COMBAT.PingCombatant" data-control="pingCombatant"><i class="fa-solid fa-fw fa-signal-stream"></i></a>`,
			);
			pingButton.on("click", async () => socket.executeAsGM("pingToken", target.id));
			pingButton.insertBefore(controls.find(".token-effects"));
		}

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

canvas.scene?.createEmbeddedDocuments("Note", [
	{
		entryId: "",
		x: 0,
		y: 0,
	},
]);

Hooks.on("renderCharacterSheetPF2e", (_app: Application, html: JQuery) => {
	characterSheetResizeObserver.observe(html[0]);
	// if (!checkMobile()) return;
	//
	// const sidebarTabButton = $(
	// 	`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
	// 		"pf2e-mobile-sheet.sidebar-tab",
	// 	)}"><i class="fa-solid fa-bars"></i></a>`,
	// );
	// const afterButton = html.find(".sheet-navigation .navigation-title");
	// if (html.find(".sheet-navigation #sidebar-tab").length === 0) sidebarTabButton.insertAfter(afterButton);
	// const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
	// const aside = html.find("aside");
	// aside.css("background-image", "none");
	// aside.find(".logo").remove();
	// sidebarTab.append(aside.detach());
	// if (html.find(".sheet-content .tab.sidebar").length === 0) html.find(".sheet-content").append(sidebarTab);
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
