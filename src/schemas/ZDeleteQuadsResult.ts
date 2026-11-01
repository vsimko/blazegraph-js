import {z} from "zod";

export interface ParsedStats {
  modified: number;
  milliseconds: number;
}

export type DeleteQuadsResult = z.infer<typeof ZDeleteQuadsResult>;

function parseDeleteStats(input: string): ParsedStats | null {
  const dataElement = input.match(/<data\b([^>]*)\/?\s*>/i);
  if (!dataElement) return null;

  const attributes: Record<string, string> = {};
  const attributePattern = /([A-Za-z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(dataElement[1])) !== null) {
    attributes[match[1]] = match[3];
  }

  if (
    attributes.modified === undefined ||
    attributes.milliseconds === undefined ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(attributes.modified.trim()) ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(attributes.milliseconds.trim())
  ) return null;

  const modified = Number(attributes.modified);
  const milliseconds = Number(attributes.milliseconds);
  if (!Number.isFinite(modified) || !Number.isFinite(milliseconds)) return null;

  return {modified, milliseconds};
}

export const ZDeleteQuadsResult = z.string().nonempty()
  .transform(parseDeleteStats)
  .refine(
    (stats): stats is ParsedStats => stats !== null,
    "Blazegraph delete response must contain a <data> element with numeric modified and milliseconds attributes"
  );
