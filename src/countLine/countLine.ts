import {exec, execSync} from 'child_process';
import {promisify} from 'util';
import {Readable, Transform} from 'stream';
import {createWriteStream} from 'fs';
import { pipeLineItems } from '@mediarithmics-ps/file-stream-toolbelt';

// TODO Only working for an UNIX env. It should be edited using stream.

export const countLines = async (filePath: string): Promise<number> => {
  return promisify(exec)(`wc -l ${filePath}`)
    .then(res => parseInt(res.stdout));
};

export const countLinesSync = (filePath: string): number => {
  return parseInt(execSync(`wc -l ${filePath}`).toString());
};

export const countLinesFromStream = async (stream: Readable) => {
  let lines = 0;
  return new Promise((resolve, reject) => {
    const parser = new Transform({
      transform: (line: Buffer, encoding, cb) => {
        lines++;
        cb(null, line);
      }
    });
    const lineSplitter = pipeLineItems.lineSplitter();
    const noop = createWriteStream('/dev/null');
    noop.on('finish', () => {
      resolve(lines);
    });
    stream
      .pipe(lineSplitter)
      .pipe(parser)
      .pipe(noop);
  });
};
