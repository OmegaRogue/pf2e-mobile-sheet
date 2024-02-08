# pf2e-mobile-sheet

Make the PF2e Player Character sheet work on mobile

![Latest Release Download Count][1]
[![Forge Installs][2]][3]
[![Foundry Hub Endorsements][4]][5]
[![Foundry Hub Comments][6]][5]
![Foundry Core Compatible Version][7]
![Repository License][8]
[![gitlocalized ][10]][9]
[![gitlocalized german][11]][9]
[![gitlocalized chinese][12]][9]

## Localization

If you want to contribute to localization, you can help translate this on https://gitlocalize.com/repo/9335

If your language is missing, open an issue or contact me otherwise about it.

## Installation

After installing the module, for using this module, I recommend you use Chrome and install foundry as a progressive web app by using "add to home screen".

For the best experience, disable the canvas on mobile clients (you may need to put your device into landscape to be able to use the settings menu, this will be fixed in a later version)

## Development

### Prerequisites

In order to build this module, recent versions of `node` and `yarn` are
required. `GNU make` or a compatible program is recommended, as type generation is only set up to be done using Makefiles.
Most likely, using `npm` also works, but only `yarn` is officially
supported. We recommend using the latest lts version of `node`. If you use `nvm`
to manage your `node` versions, you can simply run

```sh
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```sh
yarn install
```
or
```sh
make install
```

### Building

You can build the project by running

```sh
yarn build
```
or
```sh
make
```

Alternatively, you can run

```sh
yarn build:dev
```
or
```sh
make build_dev
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built module to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```json
{
  "dataPath": ["/absolute/path/to/your/FoundryVTT"]
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of
`/`)

Then run

```sh
yarn link
```
or
```sh
make install
```

On Windows, creating symlinks requires administrator privileges, so
unfortunately you need to run the above command in an administrator terminal for
it to work.

You can also link to multiple data folders by specifying multiple paths in the
`dataPath` array.

### Regenerate types
Usually, the types included in this repo are already the up to date types. If you still want to generate up to date types,
first add an entry to the `foundryconfig.json` file:
```json
{
	"dataPath": "/absolute/path/to/your/FoundryVTT/Data",
	"pf2eRepoPath": "path/to/pf2e/system/repo"
}
```
Next, run
```sh
make reposetup_types
```
to set up everything for the first time, and to update your types again later, run
```sh
make default_types
```

### Creating a release

The workflow works basically the same as the workflow of the [League Basic JS Module Template], please follow the
instructions given there.

## Licensing

This project is being developed under the terms of the
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT] for Foundry Virtual Tabletop.

This project is licensed under [GPL-3.0-or-later](COPYING.md).

The contents of many files are originally from
the Mobile Improvements module under MIT License.

- [`static/templates/menu.hbs`](static/templates/menu.hbs)
- [`static/templates/navigation.hbs`](static/templates/navigation.hbs)
- [`static/templates/window-selector.hbs`](static/templates/window-selector.hbs)
- [`static/templates/window-selector.hbs`](static/templates/mobileToggleButton.hbs)
- [`src/stykes/apps/_mobile-navigation.scss`](src/styles/apps/_mobile-navigation.scss)

build-packs license:

* The build-packs.ts script has taken from https://github.com/xdy/xdy-pf2e-workbench/blob/main/build/build-packs.ts and is, like the original,
  provided under the [ISC license](https://www.isc.org/licenses/)

project layout:

- The Project layout has been copied over from https://github.com/xdy/xdy-pf2e-workbench and is licensed under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0)

[League Basic JS Module Template]: https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT]: https://foundryvtt.com/article/license/
[Choose an open source license]: https://choosealicense.com/

[1]: https://img.shields.io/github/downloads/OmegaRogue/pf2e-mobile-sheet/latest/module.zip
[2]: https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf2e-mobile-sheet&colorB=4aa94a
[3]: https://forge-vtt.com/bazaar#package=pf2e-mobile-sheet
[4]: https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fpf2e-mobile-sheet%2Fshield%2Fendorsements
[5]: https://www.foundryvtt-hub.com/package/pf2e-mobile-sheet/
[6]: https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fpf2e-mobile-sheet%2Fshield%2Fcomments
[7]: https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FOmegaRogue%2Fpf2e-mobile-sheet%2Fmain%2Fstatic%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.minimum&colorB=orange
[8]: https://img.shields.io/github/license/OmegaRogue/pf2e-mobile-sheet
[9]: https://gitlocalize.com/repo/9335?utm_source=badge
[10]: https://gitlocalize.com/repo/9335/whole_project/badge.svg
[11]: https://gitlocalize.com/repo/9335/de/badge.svg
[12]: https://gitlocalize.com/repo/9335/zh/badge.svg
