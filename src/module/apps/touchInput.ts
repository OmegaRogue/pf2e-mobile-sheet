import { info, setBodyData } from "../utils.js";

export class TouchInput {
	cancelled = false;
	tapMaxTime = 400;
	tapStart = -1;

	getTarget(evt: PIXI.FederatedPointerEvent): PlaceableObject {
		// let target = evt.target;
		// while (target && !(target as PlaceableObject)) {
		// 	target = target.parent;
		// }
		// return target ?? null;
		return evt.target as PlaceableObject;
	}

	hook(): void {
		if (!canvas.ready) return;
		canvas.stage.on("touchstart", (_evt) => {
			this.tapStart = Date.now();
			// TODO
			// if (evt.originalEvent.touches.length > 1) {
			// 	this.cancelled = true;
			// }
		});

		canvas.stage.on("touchmove", () => (this.cancelled = true));

		canvas.stage.on("touchend", (evt) => {
			if (!this.cancelled && Date.now() - this.tapStart < this.tapMaxTime) {
				const target = this.getTarget(evt);
				if (!target) {
					setBodyData("hide-hud", "toggle");
				}
			}
			this.cancelled = false;
		});

		info(true, "Touch tap hooked");
	}
}