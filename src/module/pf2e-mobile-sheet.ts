/* eslint-disable indent */
import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { checkMobile, debug, getDebug, info, MODULE_ID, setBodyData, toggleRender } from "./utils.ts";
import * as windowMgr from "./apps/windowManager.ts";
import "./combatTracker.ts";
import "styles/pf2e-mobile-sheet.scss";
import "./resizeObservers.ts";
import { MobileUI, ViewState } from "./apps/MobileUI.ts";
import { EventSystem } from "@pixi/events";
import { PixiTouch } from "pixi.js";
// import { TouchInput } from "./apps/touchInput.js";

abstract class MobileMode {
	static get enabled() {
		return checkMobile();
	}

	static navigation: MobileUI;

	static enter(force: boolean = false) {
		ui.nav?.collapse();
		if (force) setBodyData("force-mobile-layout", "on");
		// viewHeight();
		Hooks.call("mobile-improvements:enter");
	}

	static leave(force: boolean = false) {
		if (force) setBodyData("force-mobile-layout", "off");
		Hooks.call("mobile-improvements:leave");
	}

	static viewResize(force: boolean = false) {
		debug(true, "resize");
		// if (MobileMode.enabled) viewHeight();
		if (this.enabled) MobileMode.enter(force);
		else MobileMode.leave(force);
	}
}

Hooks.once("devModeReady", async ({ registerPackageDebugFlag }: DevModeApi) => {
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

	Handlebars.registerHelper("capitalize", (str: unknown): string => {
		return String(str).capitalize();
	});

	// Register custom sheets (if any)
});

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

Hooks.on("targetToken", (user, token, targeted) => {
	if (user.id === game.user.id) return;
	const targetSettings = game.settings.get(MODULE_ID, "mobile-share-targets");
	const targettingUser = targetSettings.find((v) => v.id === user.id);
	const currentUser = targetSettings.find((v) => v.id === game.user.id);
	if (!targettingUser || !currentUser) return;
	if (!targettingUser.send) return;
	if (!currentUser.receive) return;
	token.setTarget(targeted, { releaseOthers: false });
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
	setBodyData("hide-player-list", !game.settings.get(MODULE_ID, "show-player-list"));
	setBodyData("show-mobile-toggle", game.settings.get(MODULE_ID, "show-mobile-toggle"));
	setBodyData("hotbar", false);
	toggleRender(!game.settings.get(MODULE_ID, "disable-canvas"));
	MobileMode.navigation.render(true);
	MobileMode.viewResize();

	const button = $(await renderTemplate(`modules/${MODULE_ID}/templates/mobileToggleButton.hbs`));
	button.on("click", () => {
		game.settings.set(MODULE_ID, "mobile-layout", "on");
	});
	body.append(button);
	// canvas.app.stage.on("touchstart", onDragStart);
	// canvas.app.stage.on("touchend", onDragEnd);
	// canvas.app.stage.on("touchcancel", onDragEnd);

	// // @ts-ignore
	// game.touchEvents = [];
	// game.touchEventMap = {};
	//
	// canvas.app.stage.on("touchend", (event) => {
	// 	delete game.touchEventMap[event.nativeEvent.identifier];
	// });
	// canvas.app.stage.on("touchcancel", (event) => {
	// 	delete game.touchEventMap[event.nativeEvent.identifier];
	// });
	//
	// for (const eventName of [
	// 	"globaltouchmove",
	// 	"tapcapture",
	// 	"touchcancel",
	// 	"touchend",
	// 	"tap",
	// 	"touchcancelcapture",
	// 	"touchendcapture",
	// 	"touchendoutside",
	// 	"touchendoutsidecapture",
	// 	"touchmove",
	// 	"touchmovecapture",
	// 	"touchstart",
	// 	"touchstartcapture",
	// ]) {
	// 	// // @ts-ignore
	// 	// body[0].addEventListener(
	// 	// 	eventName,
	// 	// 	(...args) => {
	// 	// 		console.log(eventName, ...args);
	// 	// 		// @ts-ignore
	// 	// 		game.touchEvents.push({ name: eventName, event: args[0] });
	// 	// 	},
	// 	// 	false,
	// 	// );
	// 	canvas.app.stage.on(eventName, (event) => {
	// 		console.log(eventName, event.nativeEvent.identifier, event.timeStamp, event);
	// 		// @ts-ignore
	// 		// game.touchEvents.push({ name: eventName, event: event });
	// 		// game.touchEventMap[event.nativeEvent.identifier] = event;
	// 	});
	// }

	libWrapper.register<Canvas, typeof Canvas.prototype._onDragSelect>(
		MODULE_ID,
		"Canvas.prototype._onDragSelect",
		function (wrapped, event) {
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
	// @ts-ignore
	const PixiNormalizePointer = `PIXI.extensions._queue["renderer-canvas-system"].["${PIXI.extensions._queue["renderer-canvas-system"].findIndex((b) => b.name === "events")}"].ref.prototype.normalizeToPointerData`;

	libWrapper.register<EventSystem, (event: TouchEvent | MouseEvent | PointerEvent) => PointerEvent[]>(
		MODULE_ID,
		PixiNormalizePointer,
		function (wrapped, event) {
			if (event instanceof TouchEvent) {
				const normalizedEvents: (PixiTouch & PointerEvent)[] = wrapped(event) as (PixiTouch & PointerEvent)[];
				const normalizedEvent = normalizedEvents[0];
				normalizedEvent.touches = event.touches;
				normalizedEvent.targetTouches = event.targetTouches;
				normalizedEvent.changedTouches = event.changedTouches;
				return [normalizedEvent];
			}
			return wrapped(event);
		},
	);
	if (!game.modules.get("zoom-pan-options")?.active) {
		libWrapper.register<Canvas, typeof Canvas.prototype._onDragCanvasPan>(
			MODULE_ID,
			"Canvas.prototype._onDragCanvasPan",
			() => {},
			libWrapper.OVERRIDE,
		);
	}

	if (!checkMobile()) return;
	if (game.modules.get("pathfinder-ui")?.active) body.addClass("pf2e-ui");
	if (game.modules.get("_chatcommands")?.active) body.addClass("chatcommander-active");
	// $(".taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar").remove();
	// $("tokenbar").remove();
	// $("canvas#board").remove();
});

// Trigger the recalculation of viewheight often. Not great performance,
// but required to work on different mobile browsers
document.addEventListener("fullscreenchange", () => setTimeout(() => MobileMode.viewResize(), 100));
window.addEventListener("resize", () => MobileMode.viewResize());
window.addEventListener("scroll", () => MobileMode.viewResize());

Hooks.on("createChatMessage", (message: ChatMessage) => {
	if (!MobileMode.enabled || !message.isAuthor) return;

	const shouldBloop =
		MobileMode.navigation.state === ViewState.Map ||
		window.WindowManager.minimizeAll() ||
		ui.sidebar.activeTab !== "chat";

	MobileMode.navigation.showSidebar();
	ui.sidebar.activateTab("chat");

	if (shouldBloop) {
		Hooks.once("renderChatMessage", (obj: ChatMessage, html: JQuery) => {
			if (obj.id !== message.id) return; // Avoid possible race condition?

			html.addClass("bloop");
			setTimeout(() => html.removeClass("bloop"), 10000);
		});
	}
});

Hooks.on("renderApplication", async (app: Application) => {
	if (app.element.css("display") === "none") app.element.css("display", "");
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

const notificationQueueProxy: ProxyHandler<typeof Notifications.prototype.queue> = {
	get: function (target: typeof Notifications.prototype.queue, key): any {
		if (key === "__isProxy") return true;

		if (key === "push") {
			return (...arg: typeof Notifications.prototype.queue) => {
				if (Hooks.call("queuedNotification", ...arg)) {
					target.push(...arg);
				}
			};
		}
		return target[key];
	},
};

Hooks.once("renderNotifications", (app: Notifications) => {
	// @ts-expect-error
	if (!app.queue?.__isProxy) {
		app.queue = new Proxy(app.queue, notificationQueueProxy);
	}
});
Hooks.on("queuedNotification", (notif: (typeof Notifications.prototype.queue)[0]) => {
	// noinspection SuspiciousTypeOfGuard
	if (typeof notif.message === "string") {
		if (notif.message.includes("Lock View and module Zoom/Pan Options modify the same FoundryVTT functionality")) {
			console.log("notification suppressed", notif);
			return false;
		}
		const regex = /\s.+px/g;
		const message = notif.message?.replace(regex, "");
		// @ts-ignore
		const match = game.i18n.translations.ERROR.LowResolution.replace(regex, "");

		// eslint-disable-next-line eqeqeq
		if (message == match) {
			console.log("notification suppressed", notif);
			return false;
		}
	}
	return true;
});

// const touchInput = new TouchInput();
// Hooks.on("canvasReady", () => touchInput.hook());

globalThis.MobileMode = MobileMode;
