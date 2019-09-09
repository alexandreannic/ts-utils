import {exec, execSync} from 'child_process';
import {promisify} from 'util';
import { Readable, Transform, Writable } from 'stream';
import { createWriteStream } from 'fs';

// TODO Only working for an UNIX env. It should be edited using stream.

export const countLines = async (filePath: string): Promise<number> => {
  return promisify(exec)(`wc -l ${filePath}`)
    .then(res => parseInt(res.stdout));
};

export const countLinesSync = (filePath: string): number => {
  return parseInt(execSync(`wc -l ${filePath}`).toString());
};

export const countLinesFromStream = async (stream: Readable) => {
  let lineParsed = 0;
  return new Promise((resolve, reject) => {
    const parser = new Transform({ 
      transform: (line: Buffer, encoding, cb) => {
        lineParsed++;
        cb(null, line);
      }
    });
    const noop = createWriteStream('/dev/null');
    noop.on('finish', () => {
      resolve(lineParsed);
    });
    stream
      .pipe(parser)
      .pipe(noop);
  });
}
