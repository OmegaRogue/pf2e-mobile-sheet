import { WindowMenu } from "./windowMenu.js";
import { MobileMenu } from "./mobileMenu.js";
import { checkMobile, MODULE_ID, setBodyData, toggleRender } from "../utils.js";

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
	Start = "start",
}

function isTabletMode() {
	return checkMobile() && window.screen.width >= 930;
}

export class MobileUI extends Application {
	state: ViewState = ViewState.Unloaded;
	drawerState: DrawerState = DrawerState.None;
	noCanvas = false;

	windowMenu: WindowMenu;
	mobileMenu: MobileMenu;

	constructor() {
		super({
			template: `modules/${MODULE_ID}/templates/navigation.hbs`,
			popOut: false,
			id: "mobile-ui",
		});

		this.windowMenu = new WindowMenu(this);
		this.mobileMenu = new MobileMenu(this);

		// Ensure HUD shows on opening a new window
		Hooks.on("WindowManager:NewRendered", this._onShowWindow.bind(this));
		Hooks.on("WindowManager:BroughtToTop", this._onShowWindow.bind(this));
		Hooks.on("WindowManager:NoneVisible", this._onHideAllWindows.bind(this));
		Hooks.on("WindowManager:NewRendered", () => {
			this.render();
		});
		Hooks.on("WindowManager:Removed", () => {
			this.render();
		});
	}

	_onShowWindow(): void {
		setBodyData("hide-hud", false);
		setBodyData("windows-open", true);

		if (isTabletMode()) {
			this.showSidebar();
		}
	}

	_onHideAllWindows(): void {
		setBodyData("windows-open", false);
	}

	override render(force?: boolean, options?: RenderOptions): this {
		this.noCanvas = game.settings.get(MODULE_ID, "disable-canvas") as boolean;
		if (this.state === ViewState.Unloaded) this.state = this.noCanvas ? ViewState.App : ViewState.Map;
		const r = super.render(force, options);
		this.windowMenu.render(force);
		this.mobileMenu.render(force);

		return r;
	}

	override activateListeners(_html: JQuery<HTMLElement>): void {
		// html.find("li").on("click", (evt) => {
		// 	const [firstClass] = evt.currentTarget.className.split(" ");
		// 	const [, name] = firstClass.split("-");
		// 	this.selectItem(name);
		// });
		this.updateMode();
		// html.before(`<div id="show-mobile-navigation"><i class="fas fa-chevron-up"></i></div>`);
		// html.siblings("#show-mobile-navigation").on("click", () => {
		// 	$(document.body).toggleClass("hide-hud");
		// });
	}

	closeDrawer(): void {
		this.setDrawerState(DrawerState.None);
	}

	showMap(): void {
		const minimized = window.WindowManager.minimizeAll();
		if (!minimized && this.state === ViewState.Map) {
			setBodyData("hide-hud", "toggle");
		}
		this.state = ViewState.Map;
		toggleRender(true);
		this.setDrawerState(DrawerState.None);
		this.updateMode();
	}

	showSidebar(): void {
		this.state = ViewState.App;
		setBodyData("hide-hud", false);
		ui.sidebar?.expand();
		if (!isTabletMode()) window.WindowManager.minimizeAll();
		// if (game.settings.get(MODULE_ID, "sidebar-pauses-render") === true) {
		// 	toggleRender(false);
		// }
		this.setDrawerState(DrawerState.None);
		this.updateMode();
	}

	showHotbar(): void {
		setBodyData("hotbar", "true");
		ui.hotbar.expand();
	}

	hideHotbar(): void {
		setBodyData("hotbar", "false");
	}

	showStartMenu(): void {
		if ($(".start-menu-options .start-menu-option.canvas").length === 0) {
			(async () => {
				$(
					await renderTemplate(
						`modules/${MODULE_ID}/templates/taskbarStartMenuAdditions.hbs`,
						this.mobileMenu.getData().filter((value) => value.name !== "reload"),
					),
				).appendTo(".start-menu-options");
			})().then();
		}
		$("div#start-menu.start-menu").addClass("active");
	}

	hideStartMenu(): void {
		$("div#start-menu.start-menu").removeClass("active");
	}

	// setWindowCount(): void {
	// 	const count = Object.values(window.WindowManager.windows).length;
	// 	this.element.find(".navigation-windows .count").html(count.toString());
	// 	if (count === 0) {
	// 		this.element.find(".navigation-windows").addClass("disabled");
	// 	} else {
	// 		this.element.find(".navigation-windows").removeClass("disabled");
	// 	}
	// 	if (this.drawerState === DrawerState.Windows) {
	// 		this.setDrawerState(DrawerState.None);
	// 	}
	// }

	setDrawerState(state: DrawerState): void {
		$(`body > .drawer`).removeClass("open");
		this.element.find(".toggle.active").removeClass("active");
		this.hideHotbar();
		this.hideStartMenu();
		if (state === DrawerState.None || state === this.drawerState) {
			this.drawerState = DrawerState.None;
			return;
		}

		this.drawerState = state;
		if (state === DrawerState.Macros) {
			this.showHotbar();
		} else if (state === DrawerState.Start) {
			this.showStartMenu();
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
			case "app":
				this.showSidebar();
				break;
			default:
				this.setDrawerState(name as DrawerState);
		}
	}

	updateMode(): void {
		this.element.find(".active:not(.toggle)").removeClass("active");

		switch (this.state) {
			case ViewState.Map:
				this.element.find(".navigation-map").addClass("active");
				setBodyData("tab", "map");
				break;
			case ViewState.App:
				this.element.find(".navigation-app").addClass("active");
				setBodyData("tab", "app");
				break;
			default:
				break;
		}
	}

	override getData() {
		let data = [
			{ name: "map", icon: "fa-map" },
			{ name: "app", icon: "fa-home" },
			{ name: "macros", icon: "fa-grip-horizontal", drawer: true },
			{ name: "menu", icon: "fa-ellipsis-h", drawer: true },
			{
				name: "windows",
				icon: "fa-window-restore",
				drawer: true,
				counter: true,
				count: Object.values(window.WindowManager.windows).length,
			},
		];
		if (
			(game.modules.get("foundry-taskbar")?.active ?? false) &&
			(game.user.isGM || game.settings.get("foundry-taskbar", "enableplayers"))
		) {
			data.unshift({ name: "start", icon: "fa-bars", drawer: true });
			data = data.filter((value) => value.name !== "menu");
		}
		return data;
	}
}
