import { MacroSchema } from "types/foundry/common/documents/macro.js";
import { MigrationBase } from "../base.ts";
/** Migrate rollActionMacro function paramas to an object */
export declare class Migration871MigrateRollActionMacroParams extends MigrationBase {
    static version: number;
    updateMacro(source: SourceFromSchema<MacroSchema>): Promise<void>;
}
