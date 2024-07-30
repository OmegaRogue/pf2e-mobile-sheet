import { ActorPF2e } from "@actor";
import { SingleCheckAction, SingleCheckActionVariant, SingleCheckActionVariantData } from "@actor/actions/index.ts";
import { ItemPF2e } from "@item";
import { CheckContextData, CheckContextOptions, CheckMacroContext } from "@system/action-macros/types.ts";
import { SkillActionOptions } from "../index.ts";
declare function grapple(options: SkillActionOptions): void;
declare class GrappleActionVariant extends SingleCheckActionVariant {
    protected checkContext<ItemType extends ItemPF2e<ActorPF2e>>(opts: CheckContextOptions<ItemType>, data: CheckContextData<ItemType>): CheckMacroContext<ItemType> | undefined;
}
declare class GrappleAction extends SingleCheckAction {
    constructor();
    protected toActionVariant(data?: SingleCheckActionVariantData): GrappleActionVariant;
}
declare const action: GrappleAction;
export { action, grapple as legacy };
