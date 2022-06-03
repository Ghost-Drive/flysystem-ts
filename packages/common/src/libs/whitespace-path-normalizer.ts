import isEmpty from 'lodash/isEmpty';
import { PathTraversalDetectedException } from '../exceptions';
import { PathNormalizerInterface } from '../interfaces';

export class WhitespacePathNormalizer implements PathNormalizerInterface {
    private removeFunkyWhiteSpace(path: string): string {
    // Remove unprintable characters and invalid unicode characters.
    // We do this check in a loop, since removing invalid unicode characters
    // can lead to new characters being created.
        const reg = /\p{C}+|^\.\//u;

        while (reg.test(path)) {
            // eslint-disable-next-line no-param-reassign
            path = path.replace(reg, '');
        }

        return path;
    }

    private normalizeRelativePath(path: string): string {
        const parts: string[] = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const part of path.split('/')) {
            switch (part) {
            case '':
            case '.':
                break;

            case '..':
                if (isEmpty(parts)) {
                    throw PathTraversalDetectedException.forPath(path);
                }
                parts.pop();
                break;

            default:
                parts.push(part);
                break;
            }
        }

        return parts.join('/');
    }

    normalizePath(path: string): string {
        // eslint-disable-next-line no-param-reassign
        path = path.replace(/\\/g, '/');
        // eslint-disable-next-line no-param-reassign
        path = this.removeFunkyWhiteSpace(path);

        return this.normalizeRelativePath(path);
    }
}
