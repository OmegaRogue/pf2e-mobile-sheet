import { debug, getBodyData } from "./utils.js";
import { Application } from "pixi.js";

export abstract class ResponsiveObserver {
	abstract mobileLayout(html: JQuery<HTMLElement>);

	abstract desktopLayout(html: JQuery<HTMLElement>);

	abstract readonly breakpoint: number;

	abstract readonly appClass: string;

	private observer: ResizeObserver;

	constructor() {
		this.observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const html = $(entry.target) as JQuery<HTMLElement>;
				if (
					(entry.contentRect.width < this.breakpoint || getBodyData("force-mobile-window") === true) &&
					!html.hasClass("mobile")
				) {
					this.mobileLayout(html);
					html.addClass("mobile");
					debug(false, "mobile", entry);
				} else if (
					(entry.contentRect.width >= this.breakpoint || getBodyData("force-mobile-window") === false) &&
					html.hasClass("mobile") &&
					!getBodyData("force-mobile-window")
				) {
					this.desktopLayout(html);
					html.removeClass("mobile");
					debug(false, "no mobile", entry);
				}
			}
		});
	}

	get resizeObserver() {
		return this.observer;
	}

	register() {
		Hooks.on(`close${this.appClass}`, this.closeHandler.bind(this));
		Hooks.on(`render${this.appClass}`, this.renderHandler.bind(this));
	}

	closeHandler(_app: Application, html: JQuery) {
		this.observer.unobserve(html[0]);
	}

	renderHandler(_app: Application, html: JQuery) {
		html = html.closest(".app");
		this.observer.observe(html[0]);
	}
}

function moveSidebarToTab(html: JQuery) {
	if (html.find(".sheet-navigation #sidebar-tab").length === 0) {
		const sidebarTabButton = $(
			`<a class="item" id="sidebar-tab" data-tab="sidebar" title="${game.i18n.localize(
				"pf2e-mobile-sheet.sidebar-tab",
			)}"><i class="fa-solid fa-bars"></i></a>`,
		);
		const afterButton = html.find(".sheet-navigation .panel-title");
		sidebarTabButton.insertAfter(afterButton);
	}

	const aside = html.find("aside");

	if (html.find(".sheet-content .tab.sidebar").length === 0) {
		const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
		sidebarTab.append(aside.detach());
		html.find(".sheet-content").append(sidebarTab);
	} else {
		html.find(".sheet-content .tab.sidebar").append(aside.detach());
	}
}

class CharacterSheetResponsiveObserver extends ResponsiveObserver {
	override mobileLayout(html: JQuery<HTMLElement>) {
		debug(false, "sidebar found", html.find("aside").length);
		moveSidebarToTab(html);
		debug(false, "sidebar found", html.find("aside").length);
	}

	override desktopLayout(html: JQuery<HTMLElement>) {
		debug(false, "sidebar found off", html.find("aside").length);
		const sidebar = html.find(".tab.sidebar aside");
		html.find(".window-content form").prepend(sidebar.detach());
		const sidebarTab: JQuery = html.find(".tab.sidebar.active");
		if (sidebarTab.length > 0) {
			sidebarTab.removeClass("active");
			html.find('a[data-tab="character"]')[0].click();
		}
		debug(false, "sidebar found", html.find("aside").length);
	}

	override readonly breakpoint: number = 745;

	override readonly appClass: string = "CharacterSheetPF2e";

	override renderHandler(_app: Application, html: JQuery) {
		super.renderHandler(_app, html);
		if (html.hasClass("mobile")) {
			moveSidebarToTab(html);
		}
	}
}

class vehicleSheetResponsiveObserver extends ResponsiveObserver {
	override mobileLayout(html: JQuery<HTMLElement>) {
		debug(false, "sidebar found", html.find("aside").length);
		moveSidebarToTab(html);
		debug(false, "sidebar found", html.find("aside").length);
	}

	override desktopLayout(html: JQuery<HTMLElement>) {
		debug(false, "sidebar found off", html.find("aside").length);
		const sidebar = html.find(".tab.sidebar aside");
		html.find(".window-content form").prepend(sidebar.detach());
		const sidebarTab: JQuery = html.find(".tab.sidebar.active");
		if (sidebarTab.length > 0) {
			sidebarTab.removeClass("active");
			html.find('a[data-tab="details"]')[0].click();
		}
		debug(false, "sidebar found", html.find("aside").length);
	}

	override readonly breakpoint: number = 585;

	override readonly appClass: string = "VehicleSheetPF2e";

	override renderHandler(_app: Application, html: JQuery) {
		super.renderHandler(_app, html);
		if (html.hasClass("mobile")) {
			moveSidebarToTab(html);
		}
	}
}

class SettingsResponsiveObserver extends ResponsiveObserver {
	override mobileLayout(html: JQuery<HTMLElement>) {
		const content = html.find("section.window-content > div:not(#mps-view-group).flexrow");
		const form = html.find(".categories");
		const scrollable = html.find(".scrollable");
		const sidebar = html.find("aside.sidebar");
		const footer = form.find("footer");
		if (content.length === 1) {
			content.removeClass("flexrow");
			content.addClass("flexcol");
		}
		content.append(scrollable);
		form.append(scrollable.children());
		scrollable.append(sidebar);
		scrollable.append(form);
		footer.prepend(html.find(".reset-all"));
		footer.addClass("flexrow");
		content.append(footer);
		const submitButton: JQuery = footer.find("button[type=submit]");
		submitButton.removeAttr("type").attr("type", "button");
		submitButton.on("click", () => form.trigger("submit"));
	}

	override desktopLayout(html: JQuery<HTMLElement>) {
		const content = html.find("section.window-content > div:not(#mps-view-group).flexcol");
		if (content.length === 1) {
			content.removeClass("flexcol");
			content.addClass("flexrow");
		}
		const form = html.find(".categories");
		const scrollable = html.find(".scrollable");
		const sidebar = html.find("aside.sidebar");
		const footer = html.find("footer");
		sidebar.append(html.find(".reset-all"));
		content.append(sidebar);
		content.append(form);
		scrollable.append(form.children());
		form.append(scrollable);
		form.append(footer);
	}

	override readonly breakpoint: number = 534;

	override readonly appClass: string = "SettingsConfig";
}

const characterSheetResizeObserver = new CharacterSheetResponsiveObserver();

const vehicleSheetResizeObserver = new vehicleSheetResponsiveObserver();

const settingsResizeObserver = new SettingsResponsiveObserver();

characterSheetResizeObserver.register();
vehicleSheetResizeObserver.register();
settingsResizeObserver.register();
