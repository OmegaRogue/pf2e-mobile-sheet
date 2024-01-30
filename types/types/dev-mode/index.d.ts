// @ts-ignore
import { Module } from "../foundry/client/core/packages.js";
// @ts-ignore
import { HookParameters } from "../foundry/client/core/hooks.js";

export {};

declare global {
	export interface DevModeModule extends Module {
		api: DevModeApi;
	}

	enum LogLevel {
		NONE = 0,
		INFO = 1,
		ERROR = 2,
		DEBUG = 3,
		WARN = 4,
		ALL = 5,
	}

	export interface DevModeApi {
		registerPackageDebugFlag(
			packageName: string,
			kind: "level",
			options?: {
				default?: LogLevel;
				choiceLabelOverrides?: Record<string, string>; // actually keyed by LogLevel number
			},
		): Promise<boolean>;

		registerPackageDebugFlag(
			packageName: string,
			kind?: "boolean",
			options?: {
				default?: boolean;
			},
		): Promise<boolean>;

		getPackageDebugValue(packageName: string, kind: "level"): LogLevel;

		getPackageDebugValue(packageName: string, kind?: "boolean"): boolean;

		/**
		 * @param type
		 * @param [iterations = 1000]
		 */
		runPerformanceTest({ type, iterations }: { type: string; iterations?: number }): Promise<void>;
	}

	type HookParamsDevModeReady = HookParameters<"devModeReady", DevModeApi>;

	// @ts-ignore
	class Hooks {
		/**
		 * Register a callback handler which should be triggered when a hook is triggered.
		 *
		 * @param hook The unique name of the hooked event
		 * @param fn   The callback function which should be triggered when the hook event occurs
		 */
		static on(...args: HookParamsDevModeReady): number;

		/**
		 * Register a callback handler for an event which is only triggered once the first time the event occurs.
		 * After a "once" hook is triggered the hook is automatically removed.
		 *
		 * @param hook  The unique name of the hooked event
		 * @param fn    The callback function which should be triggered when the hook event occurs
		 */
		static once(...args: HookParamsDevModeReady): number;
	}
}
