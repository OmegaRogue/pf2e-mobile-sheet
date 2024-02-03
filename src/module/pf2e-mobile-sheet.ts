import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { checkMobile, debug, getDebug, info, MODULE_ID, setBodyData, toggleRender } from "./utils.ts";
import * as windowMgr from "./apps/windowManager.ts";
import "./combatTracker.ts";
import "styles/pf2e-mobile-sheet.scss";
import "./resizeObservers.ts";
import { MobileUI } from "./apps/MobileUI.ts";
import Handlebars from "handlebars";

abstract class MobileMode {
	static enabled = false;
	static navigation: MobileUI;

	static enter() {
		if (MobileMode.enabled) return;
		MobileMode.enabled = true;
		ui.nav?.collapse();
		// viewHeight();
		Hooks.call("mobile-improvements:enter");
	}

	static leave() {
		if (!MobileMode.enabled) return;
		MobileMode.enabled = false;
		Hooks.call("mobile-improvements:leave");
	}

	static viewResize() {
		// if (MobileMode.enabled) viewHeight();
		// if (game.settings && getSetting(settings.PIN_MOBILE_MODE))
		// 	return MobileMode.enter();
		// if (localStorage.getItem("mobile-improvements.pinMobileMode") === "true")
		// 	return MobileMode.enter();
		if (checkMobile()) MobileMode.enter();
		else MobileMode.leave();
	}
}

Hooks.once("devModeReady", async ({ registerPackageDebugFlag }: DevModeApi) => {
	await registerPackageDebugFlag(MODULE_ID);
	getDebug();
});

const icons = {
	"": "",
	combat: "fa-fist-raised",
	scenes: "fa-map",
	scene: "fa-map",
	actors: "fa-users",
	actor: "fa-users",
	items: "fa-suitcase",
	item: "fa-suitcase",
	journal: "fa-book-open",
	tables: "fa-th-list",
	playlists: "fa-music",
	compendium: "fa-atlas",
	settings: "fa-cogs",
	npc: "fa-skull",
	character: "fa-user",
	spell: "fa-magic",
	equipment: "fa-tshirt",
	feat: "fa-hand-rock",
	class: "fa-user",
};

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
	registerHandlebarsHelpers();

	// Register custom sheets (if any)
});

function registerHandlebarsHelpers() {
	Handlebars.registerHelper("winicon", function (win: Application): string {
		let windowType: string =
			// @ts-expect-error
			win.icon ||
			// @ts-expect-error
			win.tabName ||
			// @ts-expect-error
			win?.object?.data?.type ||
			// @ts-expect-error
			win?.object?.data?.entity ||
			// @ts-expect-error
			(win.metadata ? "compendium" : "") ||
			"";
		windowType = windowType.toLowerCase();
		return icons[windowType] || windowType;
	});
}

Hooks.on("getSceneControlButtons", (hudButtons: SceneControl[]) => {
	for (const hud of hudButtons) {
		const tool: SceneControlTool = {
			name: "touch-pan",
			title: "pf2e-mobile-sheet.PanToggle",
			icon: "fa-regular fa-arrows",
			visible: true,
			toggle: true,
			onClick: async () => {
				info(true, tool.active);
			},
		};

		hud?.tools?.push(tool);
	}
});

// export function onDragMove(event: FederatedPointerEvent) {
// 	// debug(true, event);
// 	if (game.dragTarget) {
// 		debug(true, "move", event);
// 	}
// }
// // new PIXI.Point(241, 418)
//
// // @ts-ignore
// export function onDragStart(event: FederatedPointerEvent) {
// 	// debug(true, event);
// 	// store a reference to the data
// 	// the reason for this is because of multitouch
// 	// we want to track the movement of this particular touch
// 	// this.data = event.data;
// 	game.dragTarget = event.target;
// 	canvas.app.stage.on("touchmove", onDragMove);
// }
//
// // @ts-ignore
// export function onDragEnd(event: FederatedPointerEvent) {
// 	// debug(true, event);
// 	if (game.dragTarget) {
// 		if (game.dragTarget instanceof Token) {
// 			const pos = canvas.stage.transform.localTransform.applyInverse(event.global);
// 			debug(true, "testt", event, pos);
// 			game.dragTarget.document.update({ x: pos.x, y: pos.y });
// 		}
// 		canvas.app.stage.off("touchmove", onDragMove);
// 		game.dragTarget = null;
// 	}
// }

Hooks.once("ready", async () => {
	if (!game.modules.get("lib-wrapper")?.active && game.user.isGM)
		ui.notifications.error(
			"Module Pf2e Mobile Sheet requires the 'libWrapper' module. Please install and activate it.",
		);
	game.mobilemode = MobileMode;

	const body = $("body");

	setBodyData("force-hide-header-button-text", game.settings.get(MODULE_ID, "header-button-text"));
	setBodyData("force-mobile-window", game.settings.get(MODULE_ID, "mobile-windows"));
	setBodyData("force-mobile-layout", game.settings.get(MODULE_ID, "mobile-layout"));
	setBodyData("hide-player-list", game.settings.get(MODULE_ID, "show-player-list"));
	setBodyData("hotbar", false);
	toggleRender(!game.settings.get(MODULE_ID, "disable-canvas"));
	MobileMode.navigation.render(true);
	MobileMode.viewResize();

	// canvas.app.stage.on("touchstart", onDragStart);
	// canvas.app.stage.on("touchend", onDragEnd);
	// canvas.app.stage.on("touchcancel", onDragEnd);

	// for (const eventName of ["globaltouchmove","tapcapture","touchcancel","touchend","touchcancelcapture","touchendcapture","touchendoutside","touchendoutsidecapture","touchmove","touchmovecapture","touchstart","touchstartcapture"]) {
	// 	canvas.app.stage.on(eventName,(...args)=>{console.log(eventName, ...args);});
	// }
	libWrapper.register(
		MODULE_ID,
		"Canvas.prototype._onDragSelect",
		function (this: Canvas, wrapped: any, event: PIXI.FederatedEvent) {
			if (!ui.controls?.control?.tools.find((a) => a.name === "touch-pan")?.active) return wrapped(event);
			// @ts-expect-error
			// Extract event data
			const cursorTime = event.interactionData.cursorTime;
			// @ts-expect-error
			const { origin, destination } = event.interactionData;
			const dx = destination.x - origin.x;
			const dy = destination.y - origin.y;

			// Update the client's cursor position every 100ms
			const now = Date.now();
			if (now - (cursorTime || 0) > 100) {
				// @ts-expect-error
				if (this.controls) this.controls._onMouseMove(event, destination);
				// @ts-expect-error
				event.interactionData.cursorTime = now;
			}

			// Pan the canvas
			this.pan({
				x: canvas.stage.pivot.x - dx * CONFIG.Canvas.dragSpeedModifier,
				y: canvas.stage.pivot.y - dy * CONFIG.Canvas.dragSpeedModifier,
			});

			// Reset Token tab cycling
			// @ts-expect-error
			this.tokens._tabIndex = null;
		},
		libWrapper.MIXED,
	);

	if (!checkMobile()) return;
	if (game.modules.get("pathfinder-ui")?.active) body.addClass("pf2e-ui");
	if (game.modules.get("_chatcommands")?.active) body.addClass("chatcommander-active");
	// $(".taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar").remove();
	// $("tokenbar").remove();
	// $("canvas#board").remove();
});

// Trigger the recalculation of viewheight often. Not great performance,
// but required to work on different mobile browsers
document.addEventListener("fullscreenchange", () => setTimeout(MobileMode.viewResize, 100));
window.addEventListener("resize", MobileMode.viewResize);
window.addEventListener("scroll", MobileMode.viewResize);

// Hooks.on("createChatMessage", (message: ChatMessage) => {
// 	if (!MobileMode.enabled || !message.isAuthor) return;
//
// 	const shouldBloop =
// 		MobileMode.navigation.state === ViewState.Map ||
// 		window.WindowManager.minimizeAll() ||
// 		ui.sidebar.activeTab !== "chat";
//
// 	MobileMode.navigation.showSidebar();
// 	ui.sidebar.activateTab("chat");
//
// 	if (shouldBloop) {
// 		Hooks.once("renderChatMessage", (obj: ChatMessage, html: JQuery) => {
// 			if (obj.id !== message.id) return; // Avoid possible race condition?
//
// 			html.addClass("bloop");
// 			setTimeout(() => html.removeClass("bloop"), 10000);
// 		});
// 	}
// });

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

globalThis.MobileMode = MobileMode;
