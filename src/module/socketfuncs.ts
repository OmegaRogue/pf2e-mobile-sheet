import { log } from "./utils.js";
import { id as MODULE_ID } from "../../static/module.json";

async function getDistance(sourceId: string, targetId: string): Promise<number> {
	return canvas.grid.measureDistance(
		canvas.tokens.get(sourceId)?.center ?? ({} as Point),
		canvas.tokens.get(targetId)?.center ?? ({} as Point),
		{
			gridSpaces: true,
		},
	);
}

async function socketTarget(tokenDocumentId: string, userSourceId: string, releaseOthers: boolean): Promise<void> {
	const user = game.users.get(userSourceId);
	/**
	 * @var {Token} token
	 */
	const token = canvas.tokens.get(tokenDocumentId);
	let doTarget = true;
	if (user?.targets.find((t) => t.id === tokenDocumentId)) doTarget = false;
	token?.setTarget(doTarget, { user: user, releaseOthers: releaseOthers });
}

/**
 * Set this Token as an active target for the current game User
 * @param tokenId
 * @param targeted       Is the Token now targeted?
 * @param userId           Assign the token as a target for a specific User
 * @param releaseOthers  Release other active targets for the same player?
 * @param groupSelection Is this target being set as part of a group selection workflow?
 */
async function socketSetTarget(
	tokenId: string,
	userId: string,
	targeted?: boolean,
	releaseOthers?: boolean,
	groupSelection?: boolean,
): Promise<void> {
	const token = canvas.tokens.get(tokenId);
	const user = game.users.get(userId);
	token?.setTarget(targeted, { user, releaseOthers, groupSelection });
}

async function socketPing(tokenDocumentId: string): Promise<boolean> {
	const token = canvas.tokens.get(tokenDocumentId);
	if (!token?.isVisible) {
		ui.notifications.warn(game.i18n.localize("COMBAT.PingInvisibleToken"));
		return false;
	}
	return canvas.ping(token.center, {});
}

async function checkTargets(userId: string, tokenId: string): Promise<boolean> {
	const user = game.users.get(userId);
	return user?.targets.find((t) => t.id === tokenId) !== undefined;
}

async function getTargets(userId: string): Promise<Set<string> | undefined> {
	const user = game.users.get(userId);
	return user?.targets.map((value) => value.id);
}

export let socket: SocketlibSocket;

Hooks.once("socketlib.ready", () => {
	// eslint-disable-next-line no-undef
	socket = socketlib.registerModule(MODULE_ID);
	socket.register("targetToken", socketTarget);
	socket.register("pingToken", socketPing);
	socket.register("log", log);
	socket.register("distance", getDistance);
	socket.register("checkTargets", checkTargets);
	socket.register("getTargets", getTargets);
	socket.register("setTarget", socketSetTarget);
});
