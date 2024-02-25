import { checkMobile, debug, setBodyData } from "./utils.js";
import { MobileUI } from "./apps/MobileUI.js";
import { ResponsiveObserver } from "./resizeObservers.js";
export abstract class MobileMode {
	static ResponsiveObserver = ResponsiveObserver;

	static get enabled() {
		return checkMobile();
	}

	static navigation: MobileUI;

	static enter(force: boolean = false) {
		ui.nav?.collapse();
		if (force) setBodyData("force-mobile-layout", "on");
		// viewHeight();
		Hooks.call("mobile-improvements:enter");
	}

	static leave(force: boolean = false) {
		if (force) setBodyData("force-mobile-layout", "off");
		Hooks.call("mobile-improvements:leave");
	}

	static viewResize(force: boolean = false) {
		debug(true, "resize");
		// if (MobileMode.enabled) viewHeight();
		if (this.enabled) MobileMode.enter(force);
		else MobileMode.leave(force);
	}
}
