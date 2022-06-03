import {
    access as fsAccess,
    chmod as fsChmod,
    lstat as fsLstat,
    mkdir as fsMkdir,
    readdir as fsReaddir,
    rmdir as fsRmdir,
    stat as fsStat,
    unlink as fsUnlink,
    copyFile as fsCopyFile,
    readFile as fsReadFile,
    rename as fsRename,
    writeFile as fsWriteFile,
    realpath as fsRealpath,
    symlink as fsSymlink,
} from 'fs';
import { promisify } from 'util';

export const chmod = promisify(fsChmod);
export const access = promisify(fsAccess);
export const lstat = promisify(fsLstat);
export const mkdir = promisify(fsMkdir);
export const readdir = promisify(fsReaddir);
export const rmdir = promisify(fsRmdir);
export const stat = promisify(fsStat);
export const unlink = promisify(fsUnlink);
export const copyFile = promisify(fsCopyFile);
export const readFile = promisify(fsReadFile);
export const writeFile = promisify(fsWriteFile);
export const rename = promisify(fsRename);
export const realpath = promisify(fsRealpath);
export const symlink = promisify(fsSymlink);

export function pathExists(path: string): Promise<boolean> {
    return access(path)
        .then(() => true)
        .catch(() => false);
}
