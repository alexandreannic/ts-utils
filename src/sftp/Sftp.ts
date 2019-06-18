import {Client, ConnectConfig, SFTPWrapper} from 'ssh2';
import * as path from 'path';
import {FileEntry, TransferOptions} from 'ssh2-streams';
import * as fs from 'fs-extra';
import * as os from 'os';
import uuid from 'uuid/v4';
import {promisify} from 'util';
import {createFolderIfNotExists, multipleFilters} from '..';

interface ListFileParams {
  directoryPath?: string,
  regexp?: string,
  showDirs?: boolean
}

export class Sftp {

  static readonly tmpDownloadedFolder = `${os.tmpdir()}/mediarithmics-sftp-${uuid()}/`;

  private constructor(private sftp: SFTPWrapper) {
  }

  createReadStream = this.sftp.createReadStream.bind(this.sftp);

  createWriteStream = this.sftp.createWriteStream.bind(this.sftp);

  end = this.sftp.end.bind(this.sftp);

  // @ts-ignore
  // Seems to be a typescript limitation which cannot handle function overload properly
  // https://github.com/microsoft/TypeScript/issues/28020
  fastPut: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void> = promisify(this.sftp.fastPut).bind(this.sftp);

  // @ts-ignore
  rename: (srcPath: string, destPath: string) => Promise<void> = promisify(this.sftp.rename).bind(this.sftp);

  // @ts-ignore
  unlink: (path: string) => Promise<void> = promisify(this.sftp.unlink).bind(this.sftp);

  download = (remotePath: string, localPath: string = Sftp.tmpDownloadedFolder + path.basename(remotePath)): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        createFolderIfNotExists(Sftp.tmpDownloadedFolder);
      } catch (e) {
        reject(e);
      }
      this.sftp.fastGet(remotePath, localPath, (err: any) => {
        if (err) reject(err);
        resolve(localPath);
      });
    });
  };

  listFiles = ({directoryPath = '/', regexp, showDirs = true}: ListFileParams): Promise<FileEntry[]> => {
    return new Promise((resolve, reject) => {
      this.sftp.readdir(directoryPath, (err: Error, list: FileEntry[]) => {
        if (err) {
          reject(err);
        }
        const filteredList = multipleFilters(
          !!regexp && ((f: FileEntry) => new RegExp(regexp).test(f.filename)),
          showDirs && ((f: FileEntry) => !f.longname.startsWith('d')),
        )(list);

        resolve(filteredList);
      });
    });
  };

  listFilesNames = (params: ListFileParams): Promise<string[]> => {
    return this.listFiles(params).then(files => files.map(f => f.filename));
  };

  static connect = async (config: ConnectConfig): Promise<Sftp> => {
    const sftpWrapper = await Sftp.getSftpWrapper(config);
    return new Sftp(sftpWrapper);
  };

  private static getSftpWrapper = async (config: ConnectConfig): Promise<SFTPWrapper> => {
    return new Promise((resolve, reject) => {
      const client = new Client();
      client.connect(config);
      client.on('ready', () => {
        client.sftp((err: Error, sftp: SFTPWrapper) => {
          if (err) {
            reject(err);
          }
          resolve(sftp);
        });
      });
    });
  };

  static deleteTmpDownloadFolder = () => {
    fs.removeSync(Sftp.tmpDownloadedFolder);
  };
}
