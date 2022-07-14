import {
    statSync, mkdirSync, accessSync, constants,
} from 'fs';
import { dirname } from 'path';

export function isSymbolicLinkSync(dir: string): boolean {
    const dirStat = statSync(dir);
    return dirStat.isSymbolicLink();
}

export function isDirSync(dir: string): boolean {
    try {
        const dirStat = statSync(dir);
        return dirStat.isDirectory();
    } catch (e) {
        return false;
    }
}

export function isReadableSync(dir: string): boolean {
    try {
        accessSync(dir, constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function mkDirSync(dir: string, mode?: number, recursive = true): string[] {
    if (mode === undefined) {
        // eslint-disable-next-line no-bitwise, no-param-reassign
        mode = 0x1ff ^ process.umask();
    }
    const pathsCreated = [];
    const pathsFound = [];

    let cDir = dir;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const stats = statSync(cDir);

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
        mkdirSync(currentFound, mode);
        pathsCreated.push(currentFound);
    }

    return pathsCreated;
}
