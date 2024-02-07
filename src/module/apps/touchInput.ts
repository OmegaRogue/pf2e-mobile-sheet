import { info, setBodyData } from "../utils.js";
import { FederatedEventTarget, FederatedPointerEvent } from "pixi.js";
import { TouchInteractionEvent } from "../types.js";

export class TouchInput {
	twoFingerTapCancelled: boolean = false;
	tapMaxTime: number = 400;
	doubleTapMaxTime: number = 300;
	tapStart: number = -1;
	doubleTapStart: number = -1;
	doubleTapCancelled: boolean = true;
	// touches: Map<number, FederatedPointerEvent>;
	// highestTouchId: number = -1;
	// touchPoints: boolean[];

	// constructor() {
	// 	this.touches = new Map<number, FederatedPointerEvent>();
	// 	this.touchPoints = [];
	// }

	getTarget(evt: FederatedPointerEvent): PlaceableObject | null {
		const target: FederatedEventTarget | undefined = evt.target;
		// noinspection SuspiciousTypeOfGuard
		if (!(target instanceof PlaceableObject)) return null;
		return (target as PlaceableObject) ?? null;
	}

	hook(): void {
		if (!canvas.ready) return;
		canvas.stage.on("touchstart", this.onTouchStart.bind(this));
		canvas.stage.on("touchmove", this.onTouchMove.bind(this));
		canvas.stage.on("touchend", this.onTouchEnd.bind(this));
		canvas.stage.on("touchcancel", this.onTouchCancel.bind(this));
		canvas.stage.on("tap", this.onOneFingerTap.bind(this));

		info(true, "Touch tap hooked");
	}

	onTouchStart(event: TouchInteractionEvent) {
		// const id = event.nativeEvent.identifier;
		// this.touches[id] = event;
		// if (this.touchPoints.length <= id)
		// 	this.touchPoints.push(...Array<boolean>(id - this.touchPoints.length + 1).fill(false));
		// this.touchPoints[id] = true;
		// if (id > this.highestTouchId) this.highestTouchId = id;
		this.tapStart = Date.now();
		// TODO
		// console.debug(evt);
		if (event.nativeEvent.touches.length > 1) {
			this.twoFingerTapCancelled = true;
		}
	}

	// onEvent(event: FederatedPointerEvent, next: (event: FederatedPointerEvent) => void) {
	// 	if (!isPixiTouch(event.nativeEvent)) return next(event);
	// 	return next(event);
	// }

	onTouchMove(_event: TouchInteractionEvent) {
		// const id = (event.nativeEvent as PixiTouch).identifier;
		// this.touches[id] = event;
		// if (id !== this.highestTouchId) return;
		// console.debug(event);
		this.twoFingerTapCancelled = true;
	}

	onTouchEnd(event: TouchInteractionEvent) {
		// const id = (event.nativeEvent as PixiTouch).identifier;
		if (!this.twoFingerTapCancelled && Date.now() - this.tapStart < this.tapMaxTime) {
			this.onTwoFingerTap(event);
		}
		this.twoFingerTapCancelled = false;
		if (event.target instanceof Token) {
			ui.notifications.warn("token");
			// event.interactionData.destination;
			this.onDragTokenDrop(event);
			// canvas.mouseInteractionManager.callback("dragLeftDrop", event, []);
			// event.target.document.update({ x: pos.x, y: pos.y });
		}
		// this.touchPoints[id] = false;
		// delete this.touches[id];
		// if (id === this.highestTouchId) {
		// 	let i: number;
		// 	for (i = this.highestTouchId; i >= 0 && this.touchPoints[i]; i--) {
		// 		// empty
		// 	}
		// 	this.highestTouchId = i;
		// }
	}

	onTouchCancel(event: TouchInteractionEvent) {
		// const id = (event.nativeEvent as PixiTouch).identifier;
		if (event.target instanceof Token) {
			ui.notifications.warn("token");
			// event.interactionData.destination;
			// onDragTokenDrop(event);
			// canvas.mouseInteractionManager.callback("dragLeftDrop", event, []);
			// event.target.document.update({ x: pos.x, y: pos.y });
		}
		// this.touchPoints[id] = false;
		// delete this.touches[id];
		// if (id === this.highestTouchId) {
		// 	let i: number;
		// 	for (i = this.highestTouchId; i >= 0 && this.touchPoints[i]; i--) {
		// 		// empty
		// 	}
		// 	this.highestTouchId = i;
		// }
	}

	onDragTokenDrop(event: TouchInteractionEvent) {
		const clones = event.interactionData.clones || [];
		const destination = event.interactionData.destination;

		// Ensure the cursor destination is within bounds
		if (!canvas.dimensions.rect.contains(destination.x, destination.y)) return false;

		event.interactionData.clearPreviewContainer = false;

		// Compute the final dropped positions
		const updates = clones.reduce((updates, c) => {
			// Get the snapped top-left coordinate
			let dest = { x: c.document.x, y: c.document.y };
			if (!event.shiftKey && canvas.grid.type !== CONST.GRID_TYPES.GRIDLESS) {
				const isTiny = c.document.width < 1 && c.document.height < 1;
				const interval = canvas.grid.isHex ? 1 : isTiny ? 2 : 1;
				dest = canvas.grid.getSnappedPosition(dest.x, dest.y, interval, { token: c });
			}

			// Test collision for each moved token vs the central point of its destination space
			const target = c.getCenter(dest.x, dest.y);
			if (!game.user.isGM) {
				const collides = c._original.checkCollision(target);
				if (collides) {
					ui.notifications.error("RULER.MovementCollision", { localize: true, console: false });
					return updates;
				}
			}

			// Otherwise, ensure the final token center is in-bounds
			else if (!canvas.dimensions.rect.contains(target.x, target.y)) return updates;

			// Perform updates where no collision occurs
			updates.push({ _id: c._original.id, x: dest.x, y: dest.y });
			return updates;
		}, []);

		// Submit the data update
		try {
			return canvas.scene?.updateEmbeddedDocuments("Token", updates);
		} finally {
			(canvas.layers.find((l) => l instanceof TokenLayer) as TokenLayer).clearPreviewContainer();
		}
	}

	onTwoFingerTap(event: TouchInteractionEvent) {
		ui.notifications.warn(`${event.nativeEvent.identifier}`);
		const target = this.getTarget(event);
		if (!target) {
			setBodyData("hide-hud", "toggle");
		}
	}

	onOneFingerTap(event: TouchInteractionEvent) {
		if (this.doubleTapCancelled) {
			this.doubleTapStart = Date.now();
			this.doubleTapCancelled = false;
		} else if (Date.now() - this.doubleTapStart < this.doubleTapMaxTime) {
			this.onDoubleTap(event);
			this.doubleTapCancelled = true;
		} else {
			this.doubleTapCancelled = true;
		}
		// ui.notifications.warn(`${event.nativeEvent.identifier}`);
		// const target = this.getTarget(event);
		// if (!target) {
		// 	setBodyData("hide-hud", "toggle");
		// }
	}

	onDoubleTap(_event: TouchInteractionEvent) {
		// ui.notifications.warn("doubletap");
		// if (event.target instanceof Token) {
		// 	event.target.sheet.render(true);
		// }
	}
}
