import {exec, execSync} from 'child_process';
import {promisify} from 'util';

// TODO Only working for an UNIX env. It should be edited using stream.

export const countLines = async (filePath: string): Promise<number> => {
  return promisify(exec)(`wc -l ${filePath}`)
    .then(res => parseInt(res.stdout));
};

export const countLinesSync = (filePath: string): number => {
  return parseInt(execSync(`wc -l ${filePath}`).toString());
};
