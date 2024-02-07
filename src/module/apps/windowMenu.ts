import { Window, WindowManager } from "./windowManager.js";
import type { MobileUI } from "./MobileUI.js";
import { MODULE_ID } from "../utils.js";

export class WindowMenu extends Application {
	list?: JQuery<HTMLElement>;
	nav: MobileUI;

	static override get defaultOptions() {
		return fu.mergeObject(super.defaultOptions, {
			template: `modules/${MODULE_ID}/templates/window-selector.hbs`,
			popOut: false,
			id: "window-menu",
		});
	}

	constructor(nav: MobileUI) {
		super();
		this.nav = nav;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		this.list = html.find(".window-list");
		Hooks.on("WindowManager:NewRendered", (_appId) => {
			this.render();
		});
		Hooks.on("WindowManager:Removed", (_appId) => {
			this.render();
		});

		html.find("button").on("click", (ev: JQuery.ClickEvent<HTMLButtonElement>) => this.buttonHandler(ev));
	}

	buttonHandler(ev: JQuery.ClickEvent<HTMLButtonElement>) {
		ev.preventDefault();
		const win: Window | undefined = window.WindowManager.windows[$(ev.target).attr("data-id") ?? "0"];
		switch ((ev.target as HTMLButtonElement).className) {
			case "window-close":
				win.close();
				break;
			case "window-select":
				win.show();
				this.nav?.closeDrawer();
				break;
			case "window-minimize":
				win.minimize();
				break;
		}
	}

	override getData(): WindowManager {
		return window.WindowManager;
	}
}
