/* eslint-disable indent */
import { registerSettings } from "./settings.ts";
import { preloadTemplates } from "./preloadTemplates.ts";
import { checkMobile, debug, getDebug, info, MODULE_ID, setBodyData, toggleRender } from "./utils.ts";
import * as windowMgr from "./apps/windowManager.ts";
import "./combatTracker.ts";
import "styles/mobile-sheet.scss";
import "./resizeObservers.ts";
import { MobileUI, ViewState } from "./apps/MobileUI.ts";
// import nipplejs from "nipplejs";
// import { EventSystem } from "@pixi/events";
// import { PixiTouch } from "pixi.js";
// import { TouchInput } from "./apps/touchInput.js";
import { MobileMode } from "./mobileMode.js";
import "jquery-sortablejs";
import Sortable from "sortablejs";

export { ResponsiveObserver } from "./resizeObservers.js";

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

	Hooks.on("getTaskbarButtons", () => {
		if (game.modules.get("pf2e-dorako-ui")?.active ?? false) {
			$("div#taskbar.taskbar, .taskbar-workspaces").attr(
				"data-theme",
				game.settings.get("pf2e-dorako-ui", "theme.app-theme") as string,
			);
		}
	});

	// Register custom sheets (if any)
});

Hooks.on("getSceneControlButtons", (hudButtons: SceneControl[]) => {
	for (const hud of hudButtons) {
		const tool: SceneControlTool = {
			name: "touch-pan",
			title: "mobile-sheet.PanToggle",
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
	token.setTarget(targeted, { releaseOthers: currentUser.force });
});

Hooks.on("drawMeasuredTemplate", async () => {
	if (!game.joyManager) return;
});

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
	setBodyData("disable-canvas", game.settings.get(MODULE_ID, "disable-canvas"));
	setBodyData("hotbar", false);
	toggleRender(!game.settings.get(MODULE_ID, "disable-canvas"));
	MobileMode.navigation.render(true);
	MobileMode.viewResize();

	const button = $(await renderTemplate(`modules/${MODULE_ID}/templates/mobileToggleButton.hbs`));
	button.on("click", () => {
		game.settings.set(MODULE_ID, "mobile-layout", "on");
	});
	body.append(button);

	// const joy = $("<div id='joystick'/>");
	// body.append(joy);
	//
	// game.joyManager = nipplejs.create({
	// 	mode: "static",
	// 	position: { left: "10%", bottom: "10%" },
	// 	zone: joy[0],
	// });
	//
	// game.joyManager.on("start", async () => {
	// 	if (canvas.templates.preview.children.length === 0) return;
	// 	const preview = canvas.templates.preview.children[0];
	// 	const token = preview?.actor?.token;
	// 	if (!token) return;
	// 	game.previousLayer = canvas.activeLayer;
	// 	// await joystickPreview(token.center, "ray", {});
	// });
	// game.joyManager.on("end", () => {
	// 	if (canvas.templates.preview.children.length === 0) return;
	// 	const preview = canvas.templates.preview.children[0];
	// 	const token = preview?.actor?.token;
	// 	if (!token) return;
	// 	$("#nipple_0_0 .back").css("background", "white");
	// 	const pos = preview.position;
	// 	document.getElementById("board")?.dispatchEvent(
	// 		new PointerEvent("pointerdown", {
	// 			pointerType: "mouse",
	// 			isPrimary: true,
	// 			clientX: pos.x,
	// 			clientY: pos.y,
	// 			button: game.temp > 0.6 ? 0 : 2,
	// 			buttons: game.temp > 0.6 ? 1 : 2,
	// 		}),
	// 	);
	// 	document.getElementById("board")?.dispatchEvent(
	// 		new PointerEvent("pointerup", {
	// 			pointerType: "mouse",
	// 			isPrimary: true,
	// 			clientX: pos.x,
	// 			clientY: pos.y,
	// 			button: game.temp > 0.6 ? 0 : 2,
	// 			buttons: game.temp > 0.6 ? 1 : 2,
	// 		}),
	// 	);
	// });
	// game.joyManager.on("move", (_evt, data) => {
	// 	if (canvas.templates.preview.children.length === 0) return;
	// 	const preview = canvas.templates.preview.children[0];
	// 	const token = preview?.actor?.token;
	// 	if (!token) return;
	// 	game.temp = data.force;
	// 	if (data.force > 0.6) {
	// 		$("#nipple_0_0 .back").css("background", "lime");
	// 	} else {
	// 		$("#nipple_0_0 .back").css("background", "red");
	// 	}
	//
	// 	preview.document.updateSource({
	// 		...canvas.grid.getSnappedPoint(
	// 			{
	// 				x: token.center.x + (canvas.dimensions.size / 2) * Math.cos(-data.angle.radian),
	// 				y: token.center.y + (canvas.dimensions.size / 2) * Math.sin(-data.angle.radian),
	// 			},
	// 			{
	// 				mode: preview.snappingMode,
	// 			},
	// 		),
	// 		direction: Math.round(-data.angle.degree / 15) * 15,
	// 	});
	// 	preview.renderFlags.set({ refresh: true });
	// });

	libWrapper.register<typeof console, typeof console.debug>(
		MODULE_ID,
		"console.debug",
		(wrapped, message, ...args) => {
			if (typeof message === "string" && message.startsWith("pf2e-dorako-ui | renderMobileUI"))
				return wrapped(message, ...args);
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
	const SORTABLE_BASE_OPTIONS: Sortable.Options = {
		animation: 200,
		direction: "vertical",
		dragClass: "drag-preview",
		dragoverBubble: true,
		easing: "cubic-bezier(1, 0, 0, 1)",
		fallbackOnBody: true,
		filter: "div.item-summary",
		ghostClass: "drag-gap",
		group: "inventory",
		preventOnFilter: false,
		swapThreshold: 0.25,

		// These options are from the Autoscroll plugin and serve as a fallback on mobile/safari/ie/edge
		// Other browsers use the native implementation
		scroll: true,
		scrollSensitivity: 30,
		scrollSpeed: 15,

		delay: 500,
		delayOnTouchOnly: true,
	};
	for (const directoryElement of $(".directory-list")) {
		Sortable.create(directoryElement, {
			...SORTABLE_BASE_OPTIONS,
			setData: (dataTransfer, dragEl) => {
				info(true, "dragged", dragEl.dataset, dataTransfer);
				// const item = this.actor.inventory.get(dragEl.dataset.itemId, { strict: true });
				// dataTransfer.setData("text/plain", JSON.stringify({ ...item.toDragData(), fromInventory: true }));
			},
		});
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
// @ts-ignore
// globalThis.touchInput = touchInput;

function rerenderApps(_path: string): void {
	const apps = [
		...Object.values(ui.windows),
		ui.sidebar,
		game.mobilemode.navigation,
		game.mobilemode.navigation.windowMenu,
		game.mobilemode.navigation.mobileMenu,
	];
	for (const app of apps) {
		app.render();
	}
}

// HMR for template files
if (import.meta.hot) {
	import.meta.hot.on("lang-update", async ({ path }: { path: string }): Promise<void> => {
		const lang = (await fu.fetchJsonWithTimeout(path)) as object;
		if (!(typeof lang === "object")) {
			ui.notifications.error(`Failed to load ${path}`);
			return;
		}
		const apply = (): void => {
			fu.mergeObject(game.i18n.translations, lang);
			rerenderApps(path);
		};
		if (game.ready) {
			apply();
		} else {
			Hooks.once("ready", apply);
		}
	});

	import.meta.hot.on("template-update", async ({ path }: { path: string }): Promise<void> => {
		const apply = async (): Promise<void> => {
			delete Handlebars.partials[path];
			await getTemplate(path);
			rerenderApps(path);
		};
		if (game.ready) {
			apply();
		} else {
			Hooks.once("ready", apply);
		}
	});
}
