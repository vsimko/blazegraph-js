import {z} from "zod";
import {ZMutationResult} from "./ZMutationResult";

export type CreateQuadsResult = z.infer<typeof ZCreateQuadsResult>;
export const ZCreateQuadsResult = ZMutationResult;
