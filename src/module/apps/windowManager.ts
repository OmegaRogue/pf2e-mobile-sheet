import { info, MODULE_ID } from "../utils.js";

// WindowManager is a singleton that allows management of application windows
export function activate(): void {
	if (!window.WindowManager) {
		window.WindowManager = new WindowManager();
	}
}

export function getManager(): WindowManager {
	if (!window.WindowManager) {
		activate();
	}
	return window.WindowManager;
}

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

export class Window {
	readonly app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	get title(): string {
		return this.app.title;
	}

	get id(): number {
		return this.app.appId;
	}

	get minimized(): boolean {
		return this.app._minimized;
	}

	get icon(): string {
		let windowType: string =
			// @ts-expect-error
			this.app.icon ||
			// @ts-expect-error
			this.app.tabName ||
			// @ts-expect-error
			this.app?.object?.data?.type ||
			// @ts-expect-error
			this.app?.object?.data?.entity ||
			// @ts-expect-error
			(this.app.metadata ? "compendium" : "") ||
			"";
		windowType = windowType.toLowerCase();
		return icons[windowType] || windowType;
	}

	get taskbarButton(): JQuery {
		return $(".taskbar-items").find(`div[data-tiappid="${this.app.appId}"]`);
	}

	get hidden(): boolean {
		return this.taskbarButton.hasClass("open");
	}

	toggleHidden(): void {
		this.taskbarButton.click();
	}

	show(): void {
		if (this.hidden) {
			this.toggleHidden();
		}
		if (this.minimized) {
			this.app.maximize();
		}
		this.app.bringToTop();
	}

	minimize(): void {
		this.app.minimize();
	}

	close(): void {
		this.app.close();
	}
}

export class WindowManager {
	// All windows
	windows: { [id: string]: Window } = {};
	version = "1.0";
	windowChangeHandler: ProxyHandler<any> = {
		set: (target, property: string, value) => {
			target[property] = value;
			this.windowAdded(parseInt(property as string));
			// Hook for new window being rendered
			Hooks.once("render" + value.constructor.name, this.newWindowRendered);
			return true;
		},
		deleteProperty: (target, property) => {
			if (!(property in target)) return true;
			const res = delete target[property];
			setTimeout(() => {
				this.windowRemoved(parseInt(property as string));
			}, 1);
			return res;
		},
	};

	constructor() {
		ui.windows = new Proxy(ui.windows, this.windowChangeHandler);
		// Override Application bringToTop
		const windowBroughtToTop = this.windowBroughtToTop.bind(this);
		libWrapper.register<Application, typeof Application.prototype.bringToTop>(
			MODULE_ID,
			"Application.prototype.bringToTop",
			function (wrapped) {
				wrapped();
				windowBroughtToTop(this.appId);
			},
		);
		// Override Application minimize
		const windowMinimized = this.windowMinimized.bind(this);
		libWrapper.register<Application, typeof Application.prototype.minimize>(
			MODULE_ID,
			"Application.prototype.minimize",
			function (wrapped) {
				const r = wrapped();
				r.then(() => windowMinimized(this.appId));
				return r;
			},
		);

		// Override Application maximize
		const windowMaximized = this.windowMaximized.bind(this);
		libWrapper.register<Application, typeof Application.prototype.maximize>(
			MODULE_ID,
			"Application.prototype.maximize",
			function (wrapped) {
				const r = wrapped();
				r.then(() => windowMaximized(this.appId));
				return r;
			},
		);

		info(true, "Window Manager | Initiated");
		Hooks.call("WindowManager:Init");
	}

	newWindowRendered(app: Application): void {
		Hooks.call("WindowManager:NewRendered", app.appId);
	}

	windowAdded(appId: number): void {
		this.windows[appId] = new Window(ui.windows[appId]);
		Hooks.call("WindowManager:Added", appId);
	}

	windowRemoved(appId: number): void {
		delete this.windows[appId];
		Hooks.call("WindowManager:Removed", appId);
		this.checkEmpty();
	}

	windowBroughtToTop(appId: number): void {
		Hooks.call("WindowManager:BroughtToTop", appId);
	}

	windowMinimized(appId: number): void {
		Hooks.call("WindowManager:Minimized", appId);
		this.checkEmpty();
		if (
			(game.modules.get("foundry-taskbar")?.active ?? false) &&
			(game.user.isGM || game.settings.get("foundry-taskbar", "enableplayers"))
		)
			$(`.taskbar-item[data-tiappid=${appId}]`).removeClass("open");
	}

	windowMaximized(appId: number): void {
		Hooks.call("WindowManager:Maximized", appId);
		if (
			(game.modules.get("foundry-taskbar")?.active ?? false) &&
			(game.user.isGM || game.settings.get("foundry-taskbar", "enableplayers"))
		)
			$(`.taskbar-item[data-tiappid=${appId}]`).addClass("open");
	}

	checkEmpty(): void {
		const windows = Object.values(this.windows);
		if (windows.length === 0 || windows.every((w) => w.minimized)) {
			Hooks.call("WindowManager:NoneVisible");
		}
	}

	minimizeAll(): boolean {
		return Object.values(this.windows).reduce((didMinimize, window) => {
			didMinimize = didMinimize || !window.minimized;
			window.minimize();
			return didMinimize;
		}, false as boolean);
	}

	closeAll(): boolean {
		const closed = Object.keys(this.windows).length !== 0;
		Object.values(this.windows).forEach((window) => {
			window.close();
		});
		return closed;
	}
}
