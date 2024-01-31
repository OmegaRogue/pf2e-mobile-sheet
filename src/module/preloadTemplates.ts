import { id as MODULE_ID } from "@static/module.json";

export async function preloadTemplates(): Promise<void> {
	const templatePaths: string[] = [
		// Add paths to "modules/pf2e-mobile-sheet/templates"
		"modules/" + MODULE_ID + "/templates/window-selector.hbs",
		"modules/" + MODULE_ID + "/templates/navigation.hbs",
		"modules/" + MODULE_ID + "/templates/menu.hbs",
	];

	return loadTemplates(templatePaths);
}
