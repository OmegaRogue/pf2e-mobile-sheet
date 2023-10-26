export async function preloadTemplates(): Promise<void> {
	const templatePaths: string[] = [
		// Add paths to "modules/pf2e-mobile-sheet/templates"
	];

	return loadTemplates(templatePaths);
}
