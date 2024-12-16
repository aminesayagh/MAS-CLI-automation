import zod from "zod";

type Parser<T> = (value: unknown) => T;
const customSchema = <T>(parser: Parser<T>) => zod.unknown().transform(parser);

const withFallback = <T>(schema: zod.ZodType<T>, fallback: NonNullable<T>) =>
  customSchema(val => {
    const parsed = schema.safeParse(val);
    if (parsed.success) {
      return parsed.data;
    }
    return fallback;
  });

export { withFallback };
