import * as readline from 'readline';

import { RegisterUtil } from './util/register';
import { Readable, Writable } from 'stream';

declare global {
  interface AsyncGenerator<T> {
    /**
     * Converts the inbound JSON string into JS Object by way of `JSON.parse`.  This will
     * operate on individual values in the sequence, so each value should be a
     * complete document.
     */
    json<V = any>(this: AsyncGenerator<string>): AsyncGenerator<V>;
    /**
     * Converts the inbound CSV string into JS Object.  Converts by using simple CSV support and
     * splitting on commas.  Each value in the sequence is assumed to be a single row in the output.
     */
    csv<V extends readonly string[]>(
      this: AsyncGenerator<string>, columns: V
    ): AsyncGenerator<Record<V[number], string>>;
    /**
     * Will read string values from the input, delimited by new lines
     */
    prompt<V = any>(this: AsyncGenerator<string>, input?: Readable, output?: Writable): AsyncGenerator<V>;
  }
}

RegisterUtil.operators({
  json(this: AsyncGenerator<string>) {
    return this.map(x => JSON.parse(x));
  },
  csv<T extends readonly string[]>(this: AsyncGenerator<string>, columns: T) {
    return this.columns(columns, /,/);
  },
  async * prompt(this: AsyncGenerator<string>, input: Readable = process.stdin, output: Writable = process.stdout) {
    let intf: readline.Interface;
    try {
      intf = readline.createInterface({ input, output });

      for await (const message of this) {
        yield await new Promise(res =>
          intf.question(`${message}\n`, res));
      }
    } finally {
      intf!.close();
    }
  }
});