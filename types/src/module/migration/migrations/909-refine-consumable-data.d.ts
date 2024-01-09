import { ItemSourcePF2e } from "@item/base/data/index.ts";
import { MigrationBase } from "../base.ts";

/** Crunch down some needless "value objects" in consumable data, expand damage formula data */
export declare class Migration909RefineConsumableData extends MigrationBase {
	static version: number;
	#private;

	updateItem(source: ItemSourcePF2e): Promise<void>;
}
