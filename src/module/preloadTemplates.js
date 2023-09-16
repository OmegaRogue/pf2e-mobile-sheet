// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "modules/pf2e-mobile-sheet/templates"
  ];

  return loadTemplates(templatePaths);
}
