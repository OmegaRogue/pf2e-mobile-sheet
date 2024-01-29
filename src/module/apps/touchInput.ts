import { info, setBodyData } from "../utils.js";
import { FederatedEventTarget } from "pixi.js";

export class TouchInput {
	cancelled = false;
	tapMaxTime = 400;
	tapStart = -1;

	getTarget(evt: PIXI.FederatedPointerEvent): PlaceableObject | null {
		let target: FederatedEventTarget | undefined = evt.target;
		return (target as PlaceableObject) ?? null;
	}

	hook(): void {
		if (!canvas.ready) return;
		canvas.stage.on("touchstart", (_evt) => {
			this.tapStart = Date.now();
			// TODO
			// console.debug(evt);
			// // if (evt.originalEvent.touches.length > 1) {
			// // 	this.cancelled = true;
			// // }
		});

		canvas.stage.on("touchmove", (e) => {
			console.debug(e);
			this.cancelled = true;
		});

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
