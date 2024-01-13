import { ActorPF2e, type PartyPF2e } from "@actor";
import { HitPointsSummary } from "@actor/base.ts";
import { CreatureSource } from "@actor/data/index.ts";
import { StatisticModifier } from "@actor/modifiers.ts";
import { MovementType, SaveType, SkillLongForm } from "@actor/types.ts";
import { ArmorPF2e, ItemPF2e, type PhysicalItemPF2e, type ShieldPF2e } from "@item";
import { ItemType } from "@item/base/data/index.ts";
import { ItemCarryType } from "@item/physical/data.ts";
import type { ActiveEffectPF2e } from "@module/active-effect.ts";
import { Rarity, ZeroToTwo } from "@module/data.ts";
import type { UserPF2e } from "@module/user/index.ts";
import type { TokenDocumentPF2e } from "@scene/index.ts";
import type { CheckRoll } from "@system/check/index.ts";
import { Statistic, StatisticDifficultyClass, type ArmorStatistic } from "@system/statistic/index.ts";
import { PerceptionStatistic } from "@system/statistic/perception.ts";
import { CreatureSkills, CreatureSpeeds, CreatureSystemData, LabeledSpeed, VisionLevel } from "./data.ts";
import { CreatureTrait, CreatureType, CreatureUpdateContext, GetReachParameters } from "./types.ts";
/** An "actor" in a Pathfinder sense rather than a Foundry one: all should contain attributes and abilities */
declare abstract class CreaturePF2e<
	TParent extends TokenDocumentPF2e | null = TokenDocumentPF2e | null,
> extends ActorPF2e<TParent> {
	parties: Set<PartyPF2e>;
	/** A creature always has an AC */
	armorClass: StatisticDifficultyClass<ArmorStatistic>;
	/** Skill checks for the creature, built during data prep */
	skills: CreatureSkills;
	/** Saving throw rolls for the creature, built during data prep */
	saves: Record<SaveType, Statistic>;
	perception: PerceptionStatistic;

	get allowedItemTypes(): (ItemType | "physical")[];

	/** Types of creatures (as provided by bestiaries 1-3) of which this creature is a member */
	get creatureTypes(): CreatureType[];

	get rarity(): Rarity;

	get hardness(): number;

	/**
	 * A currently naive measurement of this creature's reach
	 * @param [context.action] The action context of the reach measurement. Interact actions don't consider weapons.
	 * @param [context.weapon] The "weapon," literal or otherwise, used in an attack-reach measurement
	 */
	getReach({ action, weapon }?: GetReachParameters): number;

	get visionLevel(): VisionLevel;

	get hasDarkvision(): boolean;

	get hasLowLightVision(): boolean;

	get canSee(): boolean;

	get canAct(): boolean;

	get canAttack(): boolean;

	get isDead(): boolean;

	/** Whether the creature emits sound: overridable by AE-like */
	get emitsSound(): boolean;

	get isSpellcaster(): boolean;

	get wornArmor(): ArmorPF2e<this> | null;

	/** Get the held shield of most use to the wielder */
	get heldShield(): ShieldPF2e<this> | null;

	/** Retrieve percpetion and spellcasting statistics */
	getStatistic(slug: SaveType | SkillLongForm | "perception"): Statistic;
	getStatistic(slug: string): Statistic | null;

	protected _initialize(options?: Record<string, unknown>): void;

	prepareData(): void;

	/** Setup base ephemeral data to be modified by active effects and derived-data preparation */
	prepareBaseData(): void;

	prepareEmbeddedDocuments(): void;

	prepareDerivedData(): void;

	protected prepareSynthetics(): void;

	/**
	 * Changes the carry type of an item (held/worn/stowed/etc) and/or regrips/reslots
	 * @param item       The item
	 * @param carryType  Location to be set to
	 * @param handsHeld  Number of hands being held
	 * @param inSlot     Whether the item is in the slot or not. Equivilent to "equipped" previously
	 */
	adjustCarryType(
		item: PhysicalItemPF2e<CreaturePF2e>,
		{
			carryType,
			handsHeld,
			inSlot,
		}: {
			carryType: ItemCarryType;
			handsHeld?: ZeroToTwo;
			inSlot?: boolean;
		},
	): Promise<void>;

	/**
	 * Adds a custom modifier that will be included when determining the final value of a stat. The slug generated by
	 * the name parameter must be unique for the custom modifiers for the specified stat, or it will be ignored.
	 */
	addCustomModifier(stat: string, label: string, value: number, type: string): Promise<void>;

	/** Removes a custom modifier by slug */
	removeCustomModifier(stat: string, slug: string): Promise<void>;

	/**
	 * Roll a Recovery Check
	 * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
	 */
	rollRecovery(event?: MouseEvent): Promise<Rolled<CheckRoll> | null>;

	prepareSpeed(movementType: "land"): this["system"]["attributes"]["speed"];
	prepareSpeed(movementType: Exclude<MovementType, "land">): (LabeledSpeed & StatisticModifier) | null;
	prepareSpeed(movementType: MovementType): CreatureSpeeds | (LabeledSpeed & StatisticModifier) | null;

	/** Remove any features linked to a to-be-deleted ABC item */
	deleteEmbeddedDocuments(
		embeddedName: "ActiveEffect" | "Item",
		ids: string[],
		context?: DocumentModificationContext<this>,
	): Promise<ActiveEffectPF2e<this>[] | ItemPF2e<this>[]>;

	protected _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: CreatureUpdateContext<TParent>,
		user: UserPF2e,
	): Promise<boolean | void>;

	/** Overriden to notify the party that an update is required */
	protected _onDelete(options: DocumentModificationContext<TParent>, userId: string): void;
}
interface CreaturePF2e<TParent extends TokenDocumentPF2e | null = TokenDocumentPF2e | null> extends ActorPF2e<TParent> {
    readonly _source: CreatureSource;
    system: CreatureSystemData;
    get traits(): Set<CreatureTrait>;
    get hitPoints(): HitPointsSummary;
    /** Expand DocumentModificationContext for creatures */
    update(data: Record<string, unknown>, options?: CreatureUpdateContext<TParent>): Promise<this>;
    /** See implementation in class */
    updateEmbeddedDocuments(embeddedName: "ActiveEffect", updateData: EmbeddedDocumentUpdateData[], options?: DocumentUpdateContext<this>): Promise<ActiveEffectPF2e<this>[]>;
    updateEmbeddedDocuments(embeddedName: "Item", updateData: EmbeddedDocumentUpdateData[], options?: DocumentUpdateContext<this>): Promise<ItemPF2e<this>[]>;
    updateEmbeddedDocuments(embeddedName: "ActiveEffect" | "Item", updateData: EmbeddedDocumentUpdateData[], options?: DocumentUpdateContext<this>): Promise<ActiveEffectPF2e<this>[] | ItemPF2e<this>[]>;
    deleteEmbeddedDocuments(embeddedName: "ActiveEffect", ids: string[], context?: DocumentModificationContext<this>): Promise<ActiveEffectPF2e<this>[]>;
    deleteEmbeddedDocuments(embeddedName: "Item", ids: string[], context?: DocumentModificationContext<this>): Promise<ItemPF2e<this>[]>;
    deleteEmbeddedDocuments(embeddedName: "ActiveEffect" | "Item", ids: string[], context?: DocumentModificationContext<this>): Promise<ActiveEffectPF2e<this>[] | ItemPF2e<this>[]>;
}
export { CreaturePF2e };
