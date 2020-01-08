import * as cp from 'child_process';

export type $AsyncIterable<T> = AsyncIterable<T> & Promise<T[]>;
export type IOType = 'text' | 'binary';

export type PromFunc<T, U> = (item: T) => U | Promise<U>;
export type PromFunc2<A, B, U> = (a: A, b: B) => U | Promise<U>;
export type OrCallable<X> = X | (() => X);

export type ReadDirConfig = {
  base?: string;
  full?: boolean;
};
export type ReadStreamConfig<M = IOType> = {
  mode?: M;
  singleValue?: boolean;
};
export type ExecConfig<M = IOType> = ReadStreamConfig<M> & {
  input?: IOType;
  args?: string[];
  spawn?: cp.SpawnOptions;
};
export type HttpOpts<M = IOType> = ReadStreamConfig<M> & {
  method?: string;
  headers?: Record<string, string | string[]>;
  auth?: string | null;
  timeout?: number;
  data?: AsyncIterable<string | Buffer> | Buffer | string;
  contentType?: string;
};

export type Pattern = string | Iterable<string> | RegExp;
