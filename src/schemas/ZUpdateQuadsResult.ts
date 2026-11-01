import {z} from "zod";
import {ZMutationResult} from "./ZMutationResult";

export type UpdateQuadsResult = z.infer<typeof ZUpdateQuadsResult>;
export const ZUpdateQuadsResult = ZMutationResult;
