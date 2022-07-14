export function bindErrorConstructor(that: Error, exception: Record<string, any>) {
    Object.setPrototypeOf(that, exception.prototype);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(that, that.constructor);
    }
    // eslint-disable-next-line no-param-reassign
    that.name = exception.name;
}
