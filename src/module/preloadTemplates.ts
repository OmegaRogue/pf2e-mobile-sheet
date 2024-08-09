import { MODULE_ID } from "./utils.js";

export async function preloadTemplates(): Promise<void> {
	const templatePaths: string[] = [
		// Add paths to "modules/mobile-sheet/templates"
		"modules/" + MODULE_ID + "/templates/window-selector.hbs",
		"modules/" + MODULE_ID + "/templates/navigation.hbs",
		"modules/" + MODULE_ID + "/templates/menu.hbs",
	];

	return loadTemplates(templatePaths);
}
