import { Module } from "../../types/types/foundry/client/core/packages.js";


declare module "DevMode" {
	export class DevMode extends DevModeProps {}

	interface DevModeProps {
		API: APIProps;
		LogLevel: LogLevelEnum;
		MODULE_ID: string;
		MODULE_ABBREV: string;
		SETTINGS: SettingsProps;
		TEMPLATES: TemplateProps;

		getPackageDebugValue(packageName, kind: string = "boolean"): any;

		log(force, ...args: any[]): void;

		fancyLog(object): void;

		registerPackageDebugFlag(packageName: boolean, kind: string = "boolean", options): Promise<boolean>;

		setDebugOverrides(): void;

		setCompatibilityWarnings(): void;
	}

	export interface APIProps {
		getPackageDebugValue: (packageName, kind?: string) => any;
		runPerformanceTest: any;
		registerPackageDebugFlag: (packageName, kind: string, options) => any;
	}

	export enum LogLevelEnum {
		NONE = 0,
		INFO = 1,
		ERROR = 2,
		DEBUG = 3,
		WARN = 4,
		ALL = 5,
	}
	export interface SettingsProps {
		[key: string]: string;
	}

	export interface TemplateProps {
		[key: string]: string;
	}

	export interface DevModeModule extends Module {
		api: DevMode;
	}
}
