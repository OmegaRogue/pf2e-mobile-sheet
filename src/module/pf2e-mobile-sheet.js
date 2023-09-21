import { registerSettings } from "./settings.js";
import { preloadTemplates } from "./preloadTemplates.js";
import { id as MODULE_ID } from "../module.json";
import * as math from "@pixi/math";

export let socket;

function getDebug() {
	return game.modules.get("_dev-mode")?.api?.getPackageDebugValue(MODULE_ID);
}

/**
 * @param {boolean} force
 * @param {*} args
 */
export function log(force, ...args) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.log(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

/**
 *
 * @param {string }sourceId
 * @param {string }targetId
 * @returns {Promise<number>}
 */
async function getDistance(sourceId, targetId) {
	return canvas.grid.measureDistance(canvas.tokens.get(sourceId).center, canvas.tokens.get(targetId).center, {
		gridSpaces: true,
	});
}

/**
 * @param {string} tokenDocumentId
 * @param {string} userSourceId
 * @param {boolean|boolean} releaseOthers
 */
async function socketTarget(tokenDocumentId, userSourceId, releaseOthers) {
	const user = game.users.get(userSourceId);
	/**
	 * @var {Token} token
	 */
	const token = canvas.tokens.get(tokenDocumentId);
	let doTarget = true;
	if (user.targets.find((t) => t.id === tokenDocumentId)) doTarget = false;
	token.setTarget(doTarget, { user: user, releaseOthers: releaseOthers });
}

/**
 * @param {string} tokenDocumentId
 */
async function socketPing(tokenDocumentId) {
	const token = canvas.tokens.get(tokenDocumentId);
	if (!token.visible) return ui.notifications.warn(game.i18n.localize("COMBAT.PingInvisibleToken"));
	return canvas.ping(token.center);
}

/**
 *
 * @param {string} userId
 * @param {string} tokenId
 * @returns {Promise<boolean>}
 */
async function checkTargets(userId, tokenId) {
	const user = game.users.get(userId);
	return user.targets.find((t) => t.id === tokenId) !== undefined;
}

/**
 *
 * @param {string} userId
 * @returns {Promise<Set<string>>}
 */
async function getTargets(userId) {
	const user = game.users.get(userId);
	return user.targets.map((value) => value.id);
}

Hooks.once("socketlib.ready", () => {
	// eslint-disable-next-line no-undef
	socket = socketlib.registerModule(MODULE_ID);
	socket.register("targetToken", socketTarget);
	socket.register("pingToken", socketPing);
	socket.register("remoteLog", log);
	socket.register("distance", getDistance);
	socket.register("checkTargets", checkTargets);
	socket.register("getTargets", getTargets);
});

const isMobile = window.navigator.userAgent.includes("Mobile");

function checkMobile() {
	if (getDebug()) {
		return true;
	}
	switch (game.settings.get(MODULE_ID, "mobile-mode")) {
		case "off":
			return false;
		case "on":
			return true;
		case "auto":
		default:
			return isMobile;
	}
}

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

Hooks.once("ready", async function () {
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
Hooks.on("renderChatLog", async function () {
	if (!checkMobile()) return;
	const sendButton = $(`<button type="button" class="button send-button"><i class="fas fa-paper-plane"/></button>`);
	sendButton.on("click", () => {
		document
			.querySelector("#chat-message")
			.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter" }));
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

/**
 * @param {Application} app
 * @param {jQuery} html
 * @returns {Promise<void>}
 */
async function renderFullscreenWindow(app, html) {
	if (!checkMobile()) return;
	if (!html.hasClass("window-app") || html.hasClass("dialog")) {
		log(false, app.id, html.classList);
		return;
	}
	html.addClass("fullscreen-window");
	html.css("width", "");
	html.css("height", "");
	html.css("top", "");
	html.css("left", "");
	const header = html.find("header");
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

/**
 * @param {CollectionValue<foundry.abstract.EmbeddedCollection<Combatant>>} combatants
 */
async function updateCombatTracker(combatants) {
	const scene = game.scenes.active;
	const grid = scene.grid;
	const origin = scene.tokens.find((t) => t.isOwner) || scene.tokens.get(game.user.character.id);
	for (const combatant of combatants) {
		let dist = 0;
		let isTargeted = false;
		const target = scene.tokens.get(combatant.tokenId);
		if (canvas.grid !== undefined) {
			dist = canvas.grid.measureDistance(origin.center, target.center, { gridSpaces: true });
			isTargeted = game.user.targets.find((t) => t.id === target.id) !== undefined;
		} else {
			dist = await socket.executeAsGM(getDistance, origin.id, target.id);
			isTargeted = await socket.executeAsGM(checkTargets, game.user.id, origin.id);
		}
		const combatantDisplay = $(`#combat-tracker li[data-combatant-id=${combatant.id}]`);
		const controls = combatantDisplay.find(".combatant-controls");
		// let targetIndicator = combatantDisplay.find(".users-targeting");
		if (controls.find("[data-control=toggleTarget]").length === 0) {
			const targetButton = $(
				`<a class="combatant-control" data-control="toggleTarget" data-tooltip="COMBAT.ToggleTargeting" aria-describedby="tooltip"><i class="fa-duotone fa-location-crosshairs fa-fw"></i></a>`,
			);
			targetButton.on("click", async () => {
				await socket.executeAsGM(socketTarget, target.id, game.user.id, false);
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
			pingButton.on("click", async () => socket.executeAsGM(socketPing, target.id));
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

Hooks.on("changeSidebarTab", (tab) => {
	if (tab.appId !== 24) return;
	updateCombatTracker(tab.viewed.turns);
});

Hooks.on("refreshToken", () => {
	updateCombatTracker(game.combat.turns);
});

Hooks.on("renderSettingsConfig", (_, html) => {
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
		submitButton.click(() => form.submit());
	}
});
Hooks.on("renderCharacterSheetPF2e", (_, html) => {
	if (!checkMobile()) return;

	const sidebarTabButton = $(
		`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
			"pf2e-mobile-sheet.sidebar-tab",
		)}"><i class="fa-solid fa-bars"></i></a>`,
	);
	const afterButton = html.find(".sheet-navigation .navigation-title");
	if (html.find(".sheet-navigation #sidebar-tab").length === 0) sidebarTabButton.insertAfter(afterButton);
	const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
	const aside = html.find("aside");
	aside.css("background-image", "none");
	aside.find(".logo").remove();
	aside.detach().appendTo(sidebarTab);
	if (html.find(".sheet-content .tab.sidebar").length === 0) html.find(".sheet-content").append(sidebarTab);
});

Hooks.once("devModeReady", async ({ registerPackageDebugFlag }) => {
	await registerPackageDebugFlag(MODULE_ID);
	getDebug();
});

Hooks.on("collapseSidebar", (_, collapsed) => {
	if (!checkMobile()) return;
	const sidebar = $("#sidebar");
	const collapseButton = sidebar.find(".collapse > i");
	if (collapsed) {
		collapseButton.removeClass("fa-caret-left");
		//collapseButton.addClass('fa-caret-left');
	} else {
		collapseButton.removeClass("fa-caret-right");
		//collapseButton.addClass('fa-caret-left');
	}
});
