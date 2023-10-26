import { ActorType } from "@actor/data/index.ts";
import type { BooleanField, StringField } from "types/foundry/common/data/fields.d.ts";
import { RuleElementPF2e, RuleElementSchema } from "./index.ts";
/** Substitute a pre-determined result for a check's D20 roll */
declare class CritSpecRuleElement extends RuleElementPF2e<CritSpecRuleSchema> {
    #private;
    static validActorTypes: ActorType[];
    static defineSchema(): CritSpecRuleSchema;
    static validateJoint(data: SourceFromSchema<CritSpecRuleSchema>): void;
    beforePrepareData(): void;
}
interface CritSpecRuleElement extends RuleElementPF2e<CritSpecRuleSchema>, ModelPropsFromSchema<CritSpecRuleSchema> {
}
type CritSpecRuleSchema = RuleElementSchema & {
    /** Whether this critical specialization note substitutes for the standard one of a given weapon group */
    alternate: BooleanField;
    /** Alternative note text: if not provided, the standard one for a given weapon group is used */
    text: StringField<string, string, false, true, true>;
};
export { CritSpecRuleElement };
