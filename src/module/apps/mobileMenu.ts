import type { MobileUI } from "./MobileUI.js";
import { MODULE_ID, warn } from "../utils.js";

export class MobileMenu extends Application {
	nav: MobileUI;

	constructor(nav: MobileUI) {
		super({
			template: `modules/${MODULE_ID}/templates/menu.hbs`,
			popOut: false,
		});
		this.nav = nav;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		html.find("li").on("click", (evt) => {
			const [firstClass] = evt.currentTarget.className.split(" ");
			const [, name] = firstClass.split("-");
			this.selectItem(name);
		});
	}

	toggleOpen(): void {
		this.element.toggleClass("open");
	}

	selectItem(name: string): void {
		switch (name) {
			case "fullscreen":
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					document.documentElement.requestFullscreen();
				}
				break;
			case "players":
				game.settings.set(MODULE_ID, "show-player-list", !game.settings.get(MODULE_ID, "show-player-list"));
				break;
			case "canvas":
				game.settings.set(MODULE_ID, "disable-canvas", !game.settings.get(MODULE_ID, "disable-canvas"));
				break;
			case "exit":
				game.settings.set(MODULE_ID, "mobile-layout", false);
				break;
			case "reload":
				window.location.reload();
				break;
			default:
				warn(true, "Unhandled menu item", name);
				break;
		}
		this.nav.closeDrawer();
	}

	override getData() {
		return [
			{ name: "canvas", icon: "fa-map" },
			{ name: "players", icon: "fa-users" },
			{ name: "fullscreen", icon: "fa-expand" },
			{ name: "reload", icon: "fa-sync-alt" },
			{ name: "exit", icon: "fa-mobile-alt" },
		];
	}
}
