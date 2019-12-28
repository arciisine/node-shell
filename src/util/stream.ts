import * as readline from 'readline';
import * as fs from 'fs';
import * as stream from 'stream';

import { Util } from './util';

export type IOType = 'text' | 'line' | 'binary';
export type Reader = string | String | NodeJS.ReadableStream; //eslint-disable-line
export type Writer = string | String | NodeJS.WritableStream; //eslint-disable-line

class MemoryStream extends stream.Writable {
  store: Buffer[] = [];

  _write(chunk: Buffer, enc: string, cb: Function) {
    this.store.push(chunk);
    cb();
  }

  getText() {
    return this.store.map(x => x.toString('utf8')).join('');
  }
}


export class StreamUtil {

  /**
   * Produces a writable stream that writes to memory
   */
  static memoryWritable() {
    return new MemoryStream();
  }

  /**
   * Convert sequence to stream. If the input stream are buffers, send directly.
   * Otherwise, send as text, and if mode is line, append with newline.
   */
  static toStream(gen: AsyncGenerator<any>, mode: IOType = 'line'): NodeJS.ReadableStream {
    const inp = new stream.Readable();
    inp._read = function (n: number) {
      gen.next().then(val => {
        if (val.done) {
          inp.push(null);
        } else if (val.value !== undefined) {
          if (val.value instanceof Buffer) {
            inp.push(val.value);
          } else {
            inp.push(Util.toText(val.value));
            if (mode === 'line') {
              inp.push('\n');
            }
          }
        }
      });
    };
    return inp;
  }

  /**
   * Convert read stream into a sequence
   */
  static readStream(file: Reader, mode: 'binary'): AsyncGenerator<Buffer>;
  static readStream(file: Reader, mode: 'line' | 'text'): AsyncGenerator<string>;
  static readStream(file: Reader, mode?: IOType): AsyncGenerator<string>;
  static async * readStream(file: Reader, mode: IOType = 'line'): AsyncGenerator<Buffer | string> {
    const strm = typeof file === 'string' ? fs.createReadStream(file, { encoding: 'utf8', autoClose: true }) : file;
    const src = mode === 'line' ? readline.createInterface(strm as NodeJS.ReadableStream) : strm as NodeJS.ReadableStream;

    let done = false;
    let buffer: (string | Buffer)[] = [];

    src.on('close', () => done = true);

    if (mode === 'line') {
      src.on('line', v => {
        buffer.push(typeof v === 'string' ? v : v.toString('utf8'));
      });
    } else {
      src.on('data', v => {
        buffer.push(typeof v === 'string' ? Buffer.from(v, 'utf8') : v);
      });
    }

    while (!done) {
      await new Promise(r => setTimeout(r, 50));

      if (buffer.length && mode !== 'text') {
        yield* (buffer as any);
        buffer = [];
      }
    }
    if (buffer.length) {
      if (mode === 'text') {
        yield Buffer.concat(buffer as Buffer[]).toString('utf-8');
      } else {
        yield* (buffer as any);
      }
    }
  }

  /**
   * Pipe sequence to writable output stream
   */
  static async write(src: AsyncGenerator, writable: Writer) {
    const res = typeof writable !== 'string' && 'write' in writable ? writable :
      await fs.createWriteStream(writable as string, { flags: 'w', autoClose: true });
    return src.stream().pipe(res);
  }
}