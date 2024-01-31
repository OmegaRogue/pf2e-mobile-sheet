import { id as MODULE_ID } from "@static/module.json";
import { info } from "../utils.js";

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
		libWrapper.register(MODULE_ID, "Application.prototype.bringToTop", function (wrapped: () => void) {
			wrapped();
			windowBroughtToTop(this.appId);
		});
		// Override Application minimize
		const windowMinimized = this.windowMinimized.bind(this);
		libWrapper.register(MODULE_ID, "Application.prototype.minimize", function (wrapped: () => Promise<boolean>) {
			const r = wrapped();
			r.then(() => windowMinimized(this.appId));
			return r;
		});

		// Override Application maximize
		const windowMaximized = this.windowMaximized.bind(this);
		libWrapper.register(MODULE_ID, "Application.prototype.maximize", function (wrapped: () => Promise<boolean>) {
			const r = wrapped();
			r.then(() => windowMaximized(this.appId));
			return r;
		});
		if (game.modules.get("foundry-taskbar")?.active)
			libWrapper.register(
				MODULE_ID,
				"Taskbar.createTaskbarButton",
				function (wrapped: (app: Application) => void, app: Application) {
					wrapped(app);
					// @ts-expect-error
					const button = ui.taskbar.buttons.filter((a) => a.app === app)[0].el;
					button.off("click");
					button.on("click", async () => {
						if (app._minimized) await app.maximize();
						else await app.minimize();
						button.toggleClass("open", app._minimized);
					});
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
		if (game.modules.get("foundry-taskbar")?.active) $(`.taskbar-item[data-tiappid=${appId}]`).removeClass("open");
	}

	windowMaximized(appId: number): void {
		Hooks.call("WindowManager:Maximized", appId);
		if (game.modules.get("foundry-taskbar")?.active) $(`.taskbar-item[data-tiappid=${appId}]`).addClass("open");
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
