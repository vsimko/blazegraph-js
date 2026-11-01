import {z} from "zod";

export interface MutationStats {
  modified: number;
  milliseconds: number;
}

/**
 * Parse the XML mutation response returned by Blazegraph's REST API.
 * Unexpected non-empty responses are represented as null, matching
 * the existing deleteQuads result contract.
 */
export const ZMutationResult = z.string().nonempty().transform((input): MutationStats | null => {
  const attributes = /<data\b([^>]*)\/?\s*>/i.exec(input)?.[1];
  if (attributes === undefined) return null;

  const modified = /\bmodified="([^"]+)"/i.exec(attributes)?.[1];
  const milliseconds = /\bmilliseconds="([^"]+)"/i.exec(attributes)?.[1];
  if (modified === undefined || milliseconds === undefined) return null;

  const parsedModified = Number(modified);
  const parsedMilliseconds = Number(milliseconds);
  if (!Number.isFinite(parsedModified) || !Number.isFinite(parsedMilliseconds)) return null;

  return {
    modified: parsedModified,
    milliseconds: parsedMilliseconds
  };
});
