import { WindowMenu } from "./windowMenu.js";
import { MobileMenu } from "./mobileMenu.js";
import { id as MODULE_ID } from "../../../static/module.json";
import { toggleRender } from "../utils.js";

export enum ViewState {
	Unloaded,
	Map,
	App,
}

enum DrawerState {
	None,
	Macros = "macros",
	Menu = "menu",
	Windows = "windows",
}

function isTabletMode() {
	return false;
}

export class MobileUI extends Application {
	state: ViewState = ViewState.Unloaded;
	drawerState: DrawerState = DrawerState.None;
	noCanvas = false;

	windowMenu: WindowMenu;
	mobileMenu: MobileMenu;

	constructor() {
		super({
			template: "modules/" + MODULE_ID + "/templates/navigation.hbs",
			popOut: false,
		});

		this.windowMenu = new WindowMenu(this);
		this.mobileMenu = new MobileMenu(this);

		// Ensure HUD shows on opening a new window
		// Hooks.on("WindowManager:NewRendered", () => this._onShowWindow());
		// Hooks.on("WindowManager:BroughtToTop", () => this._onShowWindow());
		// Hooks.on("WindowManager:NoneVisible", () => this._onHideAllWindows());
	}

	_onShowWindow(): void {
		$(document.body).removeClass("hide-hud");
		$(document.body).addClass("windows-open");

		if (isTabletMode()) {
			this.showSidebar();
		}
	}

	_onHideAllWindows(): void {
		$(document.body).removeClass("windows-open");
	}

	override render(force?: boolean, options?: RenderOptions): this | Promise<this> {
		this.noCanvas = game.settings.get("core", "noCanvas") as boolean;
		this.state = this.noCanvas ? ViewState.App : ViewState.Map;

		const r = super.render(force, options);
		// this.windowMenu.render(force);
		this.mobileMenu.render(force);
		return r;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		html.find("li").on("click", (evt) => {
			const [firstClass] = evt.currentTarget.className.split(" ");
			const [, name] = firstClass.split("-");
			this.selectItem(name);
		});
		this.updateMode();
		html.before(`<div id="show-mobile-navigation"><i class="fas fa-chevron-up"></i></div>`);
		html.siblings("#show-mobile-navigation").on("click", () => {
			$(document.body).toggleClass("hide-hud");
		});
		if (this.noCanvas) {
			this.element.find(".navigation-map").detach();
		}
	}

	closeDrawer(): void {
		this.setDrawerState(DrawerState.None);
	}

	showMap(): void {
		const minimized = window.WindowManager.minimizeAll();
		if (!minimized && this.state === ViewState.Map) {
			$(document.body).toggleClass("hide-hud");
		}
		this.state = ViewState.Map;
		toggleRender(true);
		this.setDrawerState(DrawerState.None);
		this.updateMode();
	}

	showSidebar(): void {
		this.state = ViewState.App;
		$(document.body).removeClass("hide-hud");
		ui.sidebar?.expand();
		if (!isTabletMode()) window.WindowManager.minimizeAll();
		if (game.settings.get(MODULE_ID, "sidebar-pauses-render") === true) {
			toggleRender(false);
		}
		this.setDrawerState(DrawerState.None);
		this.updateMode();
	}

	showHotbar(): void {
		$(document.body).addClass("show-hotbar");
		ui.hotbar.expand();
	}

	hideHotbar(): void {
		$(document.body).removeClass("show-hotbar");
	}

	setWindowCount(count: number): void {
		this.element.find(".navigation-windows .count").html(count.toString());
		if (count === 0) {
			this.element.find(".navigation-windows").addClass("disabled");
		} else {
			this.element.find(".navigation-windows").removeClass("disabled");
		}
		if (this.drawerState === DrawerState.Windows) {
			this.setDrawerState(DrawerState.None);
		}
	}

	setDrawerState(state: DrawerState): void {
		$(`body > .drawer`).removeClass("open");
		this.element.find(".toggle.active").removeClass("active");
		this.hideHotbar();
		if (state === DrawerState.None || state === this.drawerState) {
			this.drawerState = DrawerState.None;
			return;
		}

		this.drawerState = state;
		if (state === DrawerState.Macros) {
			this.showHotbar();
		} else {
			$(`body > .drawer.drawer-${state}`).addClass("open");
		}
		this.element.find(`.navigation-${state}`).addClass("active");
	}

	selectItem(name: string): void {
		switch (name) {
			case "map":
				this.showMap();
				break;
			case "sidebar":
				this.showSidebar();
				break;
			default:
				this.setDrawerState(name as DrawerState);
		}
	}

	updateMode(): void {
		this.element.find(".active:not(.toggle)").removeClass("active");
		$(document.body).removeClass("mobile-app");
		$(document.body).removeClass("mobile-map");

		switch (this.state) {
			case ViewState.Map:
				this.element.find(".navigation-map").addClass("active");
				$(document.body).addClass("mobile-map");
				break;
			case ViewState.App:
				this.element.find(".navigation-sidebar").addClass("active");
				$(document.body).addClass("mobile-app");
				break;
			default:
				break;
		}
	}
}
