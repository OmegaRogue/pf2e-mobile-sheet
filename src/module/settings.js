const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);
export function registerSettings() {
	game.settings.register("pf2e-mobile-sheet", "force-desktop", {
		name: "pf2e-mobile-sheet.settings.force-desktop.name",
		hint: "pf2e-mobile-sheet.settings.force-desktop.hint",
		config: true,
		scope: "client",
		type: Boolean,
		default: false,
		onChange: debouncedReload,
	});
	game.settings.register("pf2e-mobile-sheet", "force-send-button", {
		name: "pf2e-mobile-sheet.settings.force-send-button.name",
		hint: "pf2e-mobile-sheet.settings.force-send-button.hint",
		config: true,
		scope: "client",
		type: Boolean,
		default: false,
		onChange: debouncedReload,
	});
}
