export class PathPrefixer {
    static lTrim = /^[\\/]+/;

    static rTrim = /[\\/]+$/;

    protected readonly prefix: string;

    constructor(prefix: string, protected separator: string = '/') {
        this.prefix = prefix.replace(PathPrefixer.rTrim, '');
        if (prefix !== '') {
            this.prefix += separator;
        }
    }

    prefixPath(path: string): string {
        return `${this.prefix + path.replace(PathPrefixer.lTrim, '')}`;
    }

    stripPrefix(path: string): string {
        return path.slice(this.prefix.length);
    }

    stripDirectoryPrefix(path: string): string {
        return this.stripPrefix(path).replace(PathPrefixer.rTrim, '');
    }

    prefixDirectoryPath(path: string): string {
        const prefixedPath = this.prefixPath(path.replace(PathPrefixer.rTrim, ''));

        return ((prefixedPath.slice(-1) === this.separator)
            || (prefixedPath === ''))
            ? prefixedPath
            : `${prefixedPath}${this.separator}`;
    }
}
