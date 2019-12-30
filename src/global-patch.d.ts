import * as stream from 'stream';
import { IOType } from './util/stream';

declare global {
  interface Generator<T> {
    async: AsyncGenerator<T>;
  }
  interface AsyncGenerator<T> extends Promise<T[]> {
    async: AsyncGenerator<T>;
  }
  interface Array<T> {
    async: AsyncGenerator<T>;
  }
  interface String {
    async: AsyncGenerator<string>;
  }
  interface Number {
    async: AsyncGenerator<number>;
  }
  interface Boolean {
    async: AsyncGenerator<number>;
  }
  interface RegExp {
    async: AsyncGenerator<string>;
  }
  interface Set<T> {
    async: AsyncGenerator<T>;
  }
  interface Map<K, V> {
    async: AsyncGenerator<[K, V]>;
  }
  namespace NodeJS {
    interface ReadStream {
      async: AsyncGenerator<string>;
    }
  }
}

declare module 'fs' {
  interface ReadStream {
    async: AsyncGenerator<string>;
  }
}

declare module 'stream' {
  namespace ReadableConstructor {
    const async: AsyncGenerator<string>;
  }
}