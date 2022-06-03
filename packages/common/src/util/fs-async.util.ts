import { constants, Stats } from 'fs';
import { dirname, join } from 'path';
import { IPathStats } from '../interfaces';
import {
    access, lstat, mkdir, readdir, rmdir, stat, unlink,
} from './fs-extra.util';

export async function isSymbolicLink(dir: string): Promise<boolean> {
    try {
        const dirStat = await lstat(dir);
        return dirStat.isSymbolicLink();
    } catch (e) {
        return false;
    }
}

export async function isDir(dir: string): Promise<boolean> {
    try {
        const dirStat = await lstat(dir);
        return dirStat.isDirectory();
    // eslint-disable-next-line no-empty
    } catch (e) {}

    return false;
}

export async function isFile(file: string): Promise<boolean> {
    try {
        const dirStat = await lstat(file);
        return dirStat.isFile();
    // eslint-disable-next-line no-empty
    } catch (e) {}

    return false;
}

export async function isReadable(dir: string): Promise<boolean> {
    try {
        await access(dir, constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

export async function mkDir(dir: string, mode?: number | string): Promise<string[]> {
    if (mode === undefined) {
        // eslint-disable-next-line no-param-reassign, no-bitwise
        mode = 0x1ff ^ process.umask();
    }

    const pathsCreated: string[] = [];
    const pathsFound = [];
    let cDir = dir;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const stats = await stat(cDir);

            if (stats.isDirectory()) {
                break;
            }

            throw new Error(`Unable to create directory at ${cDir}`);
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                pathsFound.push(cDir);
                cDir = dirname(cDir);
            } else {
                throw e;
            }
        }
    }

    for (let i = pathsFound.length - 1; i > -1; i--) {
        const currentFound = pathsFound[i];

        // eslint-disable-next-line no-await-in-loop
        await mkdir(currentFound, mode as any);

        pathsCreated.push(currentFound);
    }

    return pathsCreated;
}

export async function getRecursiveDirectoryIterator(path: string): Promise<IPathStats[]> {
    const files = await readdir(path);
    const result = await Promise.all(
        files.map((file) => {
            const filePath = join(path, file);
            return lstat(filePath).then((stats: Stats) => ({
                stats,
                path: filePath,
            }));
        }),
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const item of result) {
        if (item.stats.isDirectory()) {
            // eslint-disable-next-line no-await-in-loop
            result.push(...(await getRecursiveDirectoryIterator(item.path)));
        }
    }

    return result;
}

export async function getDirectoryIterator(path: string): Promise<IPathStats[]> {
    const files = await readdir(path);
    return Promise.all(
        files.map((file) => {
            const filePath = join(path, file);
            return lstat(filePath).then((stats: Stats) => ({
                stats,
                path: filePath,
            }));
        }),
    );
}

export async function rmDir(dir: string): Promise<boolean> {
    const files = await readdir(dir);

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
        const realPath = join(dir, file);
        // eslint-disable-next-line no-await-in-loop
        const stats = await lstat(realPath);

        if (stats.isDirectory()) {
            // eslint-disable-next-line no-await-in-loop
            await rmDir(realPath);
        } else {
            // eslint-disable-next-line no-await-in-loop
            await unlink(realPath);
        }
    }

    await rmdir(dir);

    return true;
}
