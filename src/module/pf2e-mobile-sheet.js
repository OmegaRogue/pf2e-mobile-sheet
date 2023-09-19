import { registerSettings } from "./settings.js";
import { preloadTemplates } from "./preloadTemplates.js";
import { id as MODULE_ID } from "../module.json";

function getDebug() {
	return game.modules.get("_dev-mode")?.api?.getPackageDebugValue(MODULE_ID);
}

/**
 * @param {boolean} force
 * @param {*} args
 */
function log(force, ...args) {
	try {
		const isDebugging = getDebug();

		if (force || isDebugging) {
			console.log(MODULE_ID, "|", ...args);
		}
	} catch (e) {
		/* empty */
	}
}

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

// Hooks.on("changeSidebarTab", () => {
// 	//
// });
//
// Hooks.on("refreshToken", (token) => {
// 	token;
// 	//
// });

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
