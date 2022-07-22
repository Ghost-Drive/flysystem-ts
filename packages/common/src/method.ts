import { MethodEnum } from './method.enum';

export type Method<
    Name extends MethodEnum,
    Args extends any[],
    Return
> = Record<Name, (...args: Args) => Promise<Return>>;
