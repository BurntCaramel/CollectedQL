export type Root = {};
export type Context = {};

export type FieldResolverFunc = (
  root: Root | any,
  args: Record<string, any>,
  context: Context
) => any | Promise<any>;
