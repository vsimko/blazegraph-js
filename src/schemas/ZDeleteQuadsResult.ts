import {z} from "zod";

export interface ParsedStats {
  modified: number;
  milliseconds: number;
}

export type DeleteQuadsResult = z.infer<typeof ZDeleteQuadsResult>;

export const ZDeleteQuadsResult = z.string().nonempty().transform((input, ctx): ParsedStats => {
  const dataElement = input.match(/<data\b([^>]*)\/?\s*>/i);
  if (!dataElement) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Blazegraph delete response is missing the <data> element"
    });
    return z.NEVER;
  }

  const attributes: Record<string, string> = {};
  const attributePattern = /([A-Za-z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(dataElement[1])) !== null) {
    attributes[match[1]] = match[3];
  }

  const modified = Number(attributes.modified);
  const milliseconds = Number(attributes.milliseconds);
  if (
    attributes.modified === undefined ||
    attributes.milliseconds === undefined ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(attributes.modified.trim()) ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(attributes.milliseconds.trim()) ||
    !Number.isFinite(modified) ||
    !Number.isFinite(milliseconds)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Blazegraph delete response must contain numeric modified and milliseconds attributes"
    });
    return z.NEVER;
  }

  return {modified, milliseconds};
});
