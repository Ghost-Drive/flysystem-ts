import { IPromiseDeferInterface } from '../interfaces/promise-defer.interface';

export function defer<T>(): IPromiseDeferInterface<T> {
    let resolve;
    let reject;
    const promise = new Promise<T>((r, j) => {
        resolve = r;
        reject = j;
    });

    return {
        promise,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        reject,
    };
}
